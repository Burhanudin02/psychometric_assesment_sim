import { prisma } from "@/lib/db";
import { SessionMode, SessionStatus, TerminationReason } from "@prisma/client";
import {
  AnswerSubmissionItem,
  gradeAndPersistModuleAttempts,
} from "./assessmentGradingService";

export interface TerminateSessionParams {
  sessionId: string;
  moduleNumber?: number;
  answers?: AnswerSubmissionItem[];
  reason?: string;
  details?: Record<string, unknown>;
}

export interface TerminationResult {
  success: boolean;
  status: SessionStatus;
  terminationReason: TerminationReason;
  alreadyTerminated?: boolean;
  error?: string;
  result?: {
    isPartial: boolean;
    label: string;
    totalQuestionsAnswered: number;
    totalCorrect: number;
    accuracy: number;
    medianPaceSeconds: number;
    lastCompletedModule: number;
    totalModules: number;
    terminationReason: TerminationReason;
  };
}

/**
 * Single Responsibility: Assessment anti-cheat integrity event logging and termination state machine.
 */
export async function logIntegrityEvent(
  sessionId: string,
  eventType: string,
  metadata?: Record<string, unknown>,
  userId?: string,
  moduleNumber?: number
) {
  try {
    return await prisma.integrityEvent.create({
      data: {
        sessionId,
        userId,
        moduleNumber,
        eventType,
        metadata: metadata ? (metadata as any) : undefined,
      },
    });
  } catch (err) {
    console.warn("Could not log integrity event to DB:", err);
    return null;
  }
}

/**
 * Handles permanent integrity termination for a simulation session.
 * Enforces mode restrictions, idempotency, event logging, and partial metrics calculation.
 */
export async function terminateAssessmentSession(
  params: TerminateSessionParams
): Promise<{ statusCode: number; response: TerminationResult }> {
  const { sessionId, moduleNumber, answers = [], reason = "OTHER_INTEGRITY_EVENT", details } = params;

  if (!sessionId) {
    return {
      statusCode: 400,
      response: {
        success: false,
        error: "Session ID wajib disertakan.",
        status: SessionStatus.NOT_STARTED,
        terminationReason: TerminationReason.NONE,
      },
    };
  }

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      modules: { orderBy: { moduleNumber: "asc" } },
    },
  });

  if (!session) {
    return {
      statusCode: 404,
      response: {
        success: false,
        error: "Sesi simulasi tidak ditemukan.",
        status: SessionStatus.NOT_STARTED,
        terminationReason: TerminationReason.NONE,
      },
    };
  }

  // Exempt non-full simulation modes
  if (session.mode !== SessionMode.FULL_SIMULATION) {
    return {
      statusCode: 400,
      response: {
        success: false,
        error: "Penghentian integritas hanya berlaku untuk Simulasi Penuh (FULL_SIMULATION).",
        status: session.status,
        terminationReason: session.terminationReason,
      },
    };
  }

  // Idempotency: If already terminated or completed, return existing status without duplicate mutation
  if (session.status === SessionStatus.INTEGRITY_TERMINATED || session.status === SessionStatus.COMPLETED) {
    return {
      statusCode: 200,
      response: {
        success: true,
        alreadyTerminated: true,
        status: session.status,
        terminationReason: session.terminationReason,
      },
    };
  }

  const validReason = (Object.values(TerminationReason).includes(reason as TerminationReason)
    ? reason
    : TerminationReason.OTHER_INTEGRITY_EVENT) as TerminationReason;

  const now = new Date();

  // 1. Record pending answers for current module if provided
  if (moduleNumber && Array.isArray(answers) && answers.length > 0) {
    const currentMod = session.modules.find((m) => m.moduleNumber === moduleNumber);
    if (currentMod && !currentMod.isCompleted) {
      await gradeAndPersistModuleAttempts({
        sessionId,
        moduleId: currentMod.id,
        moduleDomain: currentMod.domain,
        moduleSubtopic: currentMod.subtopic,
        questionsOrder: currentMod.questionsOrder,
        answers,
        isTimedOut: false,
      });

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
  await logIntegrityEvent(
    sessionId,
    validReason,
    details,
    session.userId,
    moduleNumber || session.currentModuleNum
  );

  // 3. Mark session as terminated permanently
  await prisma.assessmentSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.INTEGRITY_TERMINATED,
      integrityTerminated: true,
      terminationReason: validReason,
      terminatedAt: now,
    },
  });

  // 4. Calculate partial metrics
  const attempts = await prisma.questionAttempt.findMany({
    where: { sessionId },
    select: {
      isAnswered: true,
      isCorrect: true,
      responseTimeMs: true,
    },
  });

  const totalAnswered = attempts.filter((a) => a.isAnswered).length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAnswered > 0 ? Number(((totalCorrect / totalAnswered) * 100).toFixed(1)) : 0;

  const validTimes = attempts
    .filter((a) => a.isAnswered && a.responseTimeMs > 0)
    .map((a) => a.responseTimeMs / 1000)
    .sort((a, b) => a - b);

  let medianPace = 0;
  if (validTimes.length > 0) {
    const mid = Math.floor(validTimes.length / 2);
    medianPace = validTimes.length % 2 !== 0 ? validTimes[mid] : (validTimes[mid - 1] + validTimes[mid]) / 2;
    medianPace = Number(medianPace.toFixed(1));
  }

  const completedModulesCount = await prisma.assessmentModule.count({
    where: { sessionId, isCompleted: true },
  });

  const resultPayload = {
    isPartial: true,
    label: "PARTIAL SIMULATION",
    totalQuestionsAnswered: totalAnswered,
    totalCorrect,
    accuracy,
    medianPaceSeconds: medianPace,
    lastCompletedModule: completedModulesCount,
    totalModules: session.totalModules,
    terminationReason: validReason,
  };

  return {
    statusCode: 200,
    response: {
      success: true,
      status: SessionStatus.INTEGRITY_TERMINATED,
      terminationReason: validReason,
      result: resultPayload,
    },
  };
}
