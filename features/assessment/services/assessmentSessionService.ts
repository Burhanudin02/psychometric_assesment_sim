import { prisma } from "@/lib/db";
import { getCurriculumBlueprint } from "@/lib/curriculum";
import { getQuestionsForModule, getQuestionById } from "@/features/questions/repository";
import { calculateModuleExpiry, validateModuleTime } from "@/features/timer/serverTimerValidator";
import { SessionMode, SessionStatus } from "@prisma/client";
import {
  AnswerSubmissionItem,
  gradeAndPersistModuleAttempts,
  computeSessionMetricsFromDb,
} from "./assessmentGradingService";

export interface SessionCreationParams {
  anonymousToken: string;
  mode?: SessionMode;
  authenticatedUserId?: string;
}

/**
 * Single Responsibility: Assessment session lifecycle orchestration.
 */
export async function createAssessmentSession(
  anonymousToken: string,
  mode: SessionMode = SessionMode.FULL_SIMULATION,
  authenticatedUserId?: string
) {
  let user;

  if (authenticatedUserId) {
    user = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
    });
  }

  if (!user) {
    user = await prisma.user.findUnique({
      where: { anonymousToken },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          anonymousToken,
          displayName: "Simulated Candidate",
        },
      });
    }
  }

  const blueprint = getCurriculumBlueprint();
  const totalModules = mode === SessionMode.FULL_SIMULATION ? 21 : 1;

  // Create session in DB
  const session = await prisma.assessmentSession.create({
    data: {
      userId: user.id,
      mode,
      status: SessionStatus.IN_PROGRESS,
      startedAt: new Date(),
      currentModuleNum: 1,
      totalModules,
    },
  });

  // Prepare modules in DB
  for (let i = 1; i <= totalModules; i++) {
    const config = blueprint.find((b) => b.moduleNumber === i);
    const timeLimitMs = (config?.timeLimitSeconds || 60) * 1000;
    const questions = await getQuestionsForModule(i, config?.defaultItemCount || 8);
    const questionIds = questions.map((q) => q.id);

    const isFirst = i === 1;
    const now = new Date();
    const startedAt = isFirst ? now : null;
    const expiresAt = isFirst ? calculateModuleExpiry(now, timeLimitMs) : null;

    await prisma.assessmentModule.create({
      data: {
        sessionId: session.id,
        moduleNumber: i,
        title: config?.title || `Module ${i}`,
        domain: config?.domain || "NUMERICAL_REASONING",
        subtopic: config?.subtopic || "general",
        timeLimitMs,
        startedAt,
        expiresAt,
        questionsOrder: questionIds,
      },
    });
  }

  return session;
}

/**
 * Retrieves the live session state, sanitizing questions for client security.
 */
export async function getActiveSessionState(sessionId: string) {
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      modules: {
        orderBy: { moduleNumber: "asc" },
      },
      result: true,
    },
  });

  if (!session) return null;

  if (session.status === SessionStatus.INTEGRITY_TERMINATED) {
    return {
      session,
      isTerminated: true,
      terminationReason: session.terminationReason,
      isCompleted: false,
      currentModule: null,
      questions: [],
      savedAnswers: {},
      remainingMs: 0,
      serverTime: new Date().toISOString(),
    };
  }

  if (session.status === SessionStatus.COMPLETED) {
    return {
      session,
      isCompleted: true,
      currentModule: null,
      questions: [],
      savedAnswers: {},
      remainingMs: 0,
      serverTime: new Date().toISOString(),
    };
  }

  // Find active module
  let activeModule = session.modules.find((m) => m.moduleNumber === session.currentModuleNum);
  if (!activeModule) {
    activeModule = session.modules[0];
  }

  // Auto-start active module timer if not started
  const now = new Date();
  if (!activeModule.startedAt) {
    const expiresAt = calculateModuleExpiry(now, activeModule.timeLimitMs);
    activeModule = await prisma.assessmentModule.update({
      where: { id: activeModule.id },
      data: {
        startedAt: now,
        expiresAt,
      },
    });
  }

  // Check if active module has expired on server
  if (
    activeModule.expiresAt &&
    now.getTime() >= activeModule.expiresAt.getTime() &&
    !activeModule.isCompleted
  ) {
    // Automatically close module and advance
    await submitModuleAnswersInternal({
      sessionId: session.id,
      moduleNumber: activeModule.moduleNumber,
      answers: [],
      isTimedOut: true,
    });
    // Re-fetch state
    return getActiveSessionState(sessionId);
  }

  // Load question items for this module
  const questionIds = activeModule.questionsOrder || [];
  const questionPromises = questionIds.map((qid) => getQuestionById(qid));
  const resolved = await Promise.all(questionPromises);
  const rawQuestions = resolved.filter(Boolean);

  // Security: In FULL_SIMULATION, strip answer key, explanation, and strategy from client payloads
  const sanitizedQuestions = rawQuestions.map((q) => {
    if (session.mode === SessionMode.FULL_SIMULATION) {
      const { correctAnswer, explanation, solvingStrategy, ...safeQuestion } = q!;
      return safeQuestion;
    }
    return q;
  });

  // Load existing attempts for this module
  const existingAttempts = await prisma.questionAttempt.findMany({
    where: {
      sessionId,
      moduleId: activeModule.id,
    },
  });

  const savedAnswers: Record<string, string> = {};
  for (const att of existingAttempts) {
    if (att.selectedAnswer) {
      savedAnswers[att.questionId] = att.selectedAnswer;
    }
  }

  const remainingMs = activeModule.expiresAt
    ? Math.max(0, activeModule.expiresAt.getTime() - now.getTime())
    : activeModule.timeLimitMs;

  return {
    session,
    isCompleted: false,
    currentModule: activeModule,
    questions: sanitizedQuestions,
    savedAnswers,
    remainingMs,
    serverTime: now.toISOString(),
  };
}

/**
 * Handles module submission, grading, and progression to the next module.
 */
export async function submitModuleAnswersInternal(params: {
  sessionId: string;
  moduleNumber: number;
  answers: AnswerSubmissionItem[];
  isTimedOut?: boolean;
}) {
  const { sessionId, moduleNumber, answers, isTimedOut = false } = params;

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      modules: { orderBy: { moduleNumber: "asc" } },
    },
  });

  if (!session) throw new Error("Session not found");
  if (session.status === SessionStatus.COMPLETED) {
    return { isFinished: true, nextModuleNumber: null };
  }

  const currentMod = session.modules.find((m) => m.moduleNumber === moduleNumber);
  if (!currentMod) throw new Error("Module not found");

  if (currentMod.isCompleted) {
    return {
      isFinished: session.currentModuleNum > session.totalModules,
      nextModuleNumber: Math.min(session.totalModules, moduleNumber + 1),
    };
  }

  const now = new Date();
  const timeValidation = currentMod.startedAt
    ? validateModuleTime(currentMod.startedAt, currentMod.timeLimitMs, now)
    : { isValid: true, isExpired: false };

  // Grade and persist attempts via unified grading service
  await gradeAndPersistModuleAttempts({
    sessionId,
    moduleId: currentMod.id,
    moduleDomain: currentMod.domain,
    moduleSubtopic: currentMod.subtopic,
    questionsOrder: currentMod.questionsOrder,
    answers,
    isTimedOut: isTimedOut || timeValidation.isExpired,
  });

  // Mark current module completed
  await prisma.assessmentModule.update({
    where: { id: currentMod.id },
    data: {
      isCompleted: true,
      isTimedOut: isTimedOut || timeValidation.isExpired,
      finishedAt: now,
    },
  });

  // Advance or finalize
  if (moduleNumber < session.totalModules) {
    const nextModNum = moduleNumber + 1;
    const nextMod = session.modules.find((m) => m.moduleNumber === nextModNum);

    if (nextMod) {
      const nextExpires = calculateModuleExpiry(now, nextMod.timeLimitMs);
      await prisma.assessmentModule.update({
        where: { id: nextMod.id },
        data: {
          startedAt: now,
          expiresAt: nextExpires,
        },
      });
    }

    await prisma.assessmentSession.update({
      where: { id: session.id },
      data: {
        currentModuleNum: nextModNum,
      },
    });

    return { isFinished: false, nextModuleNumber: nextModNum };
  } else {
    await finalizeAssessmentSession(session.id);
    return { isFinished: true, nextModuleNumber: null };
  }
}

/**
 * Finalizes assessment session and persists aggregate scores and domain quadrants.
 */
export async function finalizeAssessmentSession(sessionId: string) {
  const metrics = await computeSessionMetricsFromDb(sessionId);

  // Persist AssessmentResult
  const result = await prisma.assessmentResult.upsert({
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

  // Mark session completed
  await prisma.assessmentSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.COMPLETED,
      finishedAt: new Date(),
    },
  });

  return result;
}
