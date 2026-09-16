import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SessionStatus, TerminationReason } from "@prisma/client";
import { calculateSessionMetrics } from "@/features/scoring/calculator";
import { classifyError } from "@/features/review/errorClassifier";
import { getQuestionById } from "@/features/questions/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, moduleNumber, answers = [], reason = "OTHER_INTEGRITY_EVENT" } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Session ID wajib disertakan." }, { status: 400 });
    }

    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        modules: { orderBy: { moduleNumber: "asc" } },
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Sesi simulasi tidak ditemukan." }, { status: 404 });
    }

    // Idempotency: If already terminated or completed, do not re-terminate
    if (session.status === SessionStatus.INTEGRITY_TERMINATED || session.status === SessionStatus.COMPLETED) {
      return NextResponse.json({
        success: true,
        alreadyTerminated: true,
        status: session.status,
        terminationReason: session.terminationReason,
      });
    }

    const validReason = (Object.values(TerminationReason).includes(reason as TerminationReason)
      ? reason
      : TerminationReason.OTHER_INTEGRITY_EVENT) as TerminationReason;

    const now = new Date();

    // 1. Record pending answers for current module if provided
    if (moduleNumber && Array.isArray(answers) && answers.length > 0) {
      const currentMod = session.modules.find((m) => m.moduleNumber === moduleNumber);
      if (currentMod && !currentMod.isCompleted) {
        const answersMap = new Map<string, any>();
        for (const a of answers) {
          answersMap.set(a.questionId, a);
        }

        for (const qid of currentMod.questionsOrder) {
          const submitted = answersMap.get(qid);
          const qData = await getQuestionById(qid);
          const isAnswered = Boolean(submitted?.selectedAnswer);
          const isCorrect = isAnswered && qData ? submitted?.selectedAnswer === qData.correctAnswer : false;
          const responseTimeMs = submitted?.responseTimeMs || 0;

          const errorEval = classifyError({
            isCorrect,
            isAnswered,
            isTimedOut: false,
            responseTimeMs,
            domain: currentMod.domain,
            subtopic: currentMod.subtopic,
          });

          await prisma.questionAttempt.create({
            data: {
              sessionId,
              moduleId: currentMod.id,
              questionId: qid,
              questionVersion: qData?.version || 1,
              selectedAnswer: submitted?.selectedAnswer || null,
              isAnswered,
              isCorrect,
              responseTimeMs,
              isTimedOut: false,
              errorCategory: errorEval.category as any,
            },
          });
        }

        await prisma.assessmentModule.update({
          where: { id: currentMod.id },
          data: {
            isCompleted: true,
            finishedAt: now,
          },
        });
      }
    }

    // 2. Log Integrity Event
    await prisma.integrityEvent.create({
      data: {
        sessionId,
        userId: session.userId,
        moduleNumber: moduleNumber || session.currentModuleNum,
        eventType: validReason,
        metadata: {
          reason: validReason,
          action: "TERMINATE_SIMULATION",
          timestamp: now.toISOString(),
        },
      },
    });

    // 3. Compute partial results
    const allAttempts = await prisma.questionAttempt.findMany({
      where: { sessionId },
      include: { question: true, module: true },
    });

    const modules = await prisma.assessmentModule.findMany({
      where: { sessionId },
    });
    const timeoutsCount = modules.filter((m) => m.isTimedOut).length;

    const attemptInputs = allAttempts.map((a) => ({
      questionId: a.questionId,
      moduleId: a.moduleId,
      moduleNumber: a.module.moduleNumber,
      domain: a.module.domain,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.question.correctAnswer,
      isCorrect: a.isCorrect,
      isAnswered: a.isAnswered,
      responseTimeMs: a.responseTimeMs,
      isTimedOut: a.isTimedOut,
    }));

    const metrics = calculateSessionMetrics(attemptInputs, timeoutsCount);

    // Persist AssessmentResult
    await prisma.assessmentResult.upsert({
      where: { sessionId },
      update: {
        totalQuestions: metrics.totalQuestions,
        totalAnswered: metrics.totalAnswered,
        totalCorrect: metrics.totalCorrect,
        totalIncorrect: metrics.totalIncorrect,
        totalUnanswered: metrics.totalUnanswered,
        accuracy: metrics.accuracy,
        effectivePaceRate: metrics.effectivePaceRate,
        averageResponseTimeMs: metrics.averageResponseTimeMs,
        medianResponseTimeMs: metrics.medianResponseTimeMs,
        timeoutCount: metrics.timeoutCount,
        speedScore: metrics.speedScore,
        consistencyScore: metrics.consistencyScore,
        fatigueIndex: metrics.fatigueIndex,
        speedAccuracyCategory: metrics.speedAccuracyCategory,
      },
      create: {
        sessionId,
        totalQuestions: metrics.totalQuestions,
        totalAnswered: metrics.totalAnswered,
        totalCorrect: metrics.totalCorrect,
        totalIncorrect: metrics.totalIncorrect,
        totalUnanswered: metrics.totalUnanswered,
        accuracy: metrics.accuracy,
        effectivePaceRate: metrics.effectivePaceRate,
        averageResponseTimeMs: metrics.averageResponseTimeMs,
        medianResponseTimeMs: metrics.medianResponseTimeMs,
        timeoutCount: metrics.timeoutCount,
        speedScore: metrics.speedScore,
        consistencyScore: metrics.consistencyScore,
        fatigueIndex: metrics.fatigueIndex,
        speedAccuracyCategory: metrics.speedAccuracyCategory,
      },
    });

    // Persist DomainResults
    for (const ds of metrics.domainScores) {
      await prisma.domainResult.upsert({
        where: {
          sessionId_domain: {
            sessionId,
            domain: ds.domain,
          },
        },
        update: {
          totalItems: ds.totalItems,
          attempted: ds.attempted,
          correct: ds.correct,
          accuracy: ds.accuracy,
          averageResponseTimeMs: ds.averageResponseTimeMs,
          medianResponseTimeMs: ds.medianResponseTimeMs,
          timeoutRate: ds.timeoutRate,
          quadrant: ds.quadrant,
        },
        create: {
          sessionId,
          domain: ds.domain,
          totalItems: ds.totalItems,
          attempted: ds.attempted,
          correct: ds.correct,
          accuracy: ds.accuracy,
          averageResponseTimeMs: ds.averageResponseTimeMs,
          medianResponseTimeMs: ds.medianResponseTimeMs,
          timeoutRate: ds.timeoutRate,
          quadrant: ds.quadrant,
        },
      });
    }

    // 4. Update session status to INTEGRITY_TERMINATED
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.INTEGRITY_TERMINATED,
        terminationReason: validReason,
        terminatedAt: now,
        integrityTerminated: true,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId,
      status: SessionStatus.INTEGRITY_TERMINATED,
      terminationReason: validReason,
      completedAttemptsCount: allAttempts.length,
    });
  } catch (err: any) {
    console.error("Error terminating simulation:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

