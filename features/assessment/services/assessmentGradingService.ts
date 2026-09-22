import { prisma } from "@/lib/db";
import { getQuestionById } from "@/features/questions/repository";
import { classifyError } from "@/features/review/errorClassifier";
import { calculateSessionMetrics, CalculatedSessionResults } from "@/features/scoring/calculator";

export interface AnswerSubmissionItem {
  questionId: string;
  selectedAnswer: string | null;
  responseTimeMs: number;
}

export interface GradeAndPersistModuleParams {
  sessionId: string;
  moduleId: string;
  moduleDomain: string;
  moduleSubtopic: string;
  questionsOrder: string[];
  answers: AnswerSubmissionItem[];
  isTimedOut?: boolean;
}

/**
 * Single Responsibility: Unified grading and persistence service for module submissions.
 * Eliminates duplicate attempt grading between normal submissions and emergency terminations.
 */
export async function gradeAndPersistModuleAttempts(
  params: GradeAndPersistModuleParams
): Promise<void> {
  const {
    sessionId,
    moduleId,
    moduleDomain,
    moduleSubtopic,
    questionsOrder,
    answers,
    isTimedOut = false,
  } = params;

  const answersMap = new Map<string, AnswerSubmissionItem>();
  for (const a of answers) {
    answersMap.set(a.questionId, a);
  }

  for (const qid of questionsOrder) {
    const submitted = answersMap.get(qid);
    const qData = await getQuestionById(qid);

    const isAnswered = Boolean(submitted?.selectedAnswer);
    const isCorrect = isAnswered && qData ? submitted?.selectedAnswer === qData.correctAnswer : false;
    const responseTimeMs = submitted?.responseTimeMs || 0;

    const errorEval = classifyError({
      isCorrect,
      isAnswered,
      isTimedOut: isTimedOut && !isAnswered,
      responseTimeMs,
      domain: moduleDomain,
      subtopic: moduleSubtopic,
    });

    await prisma.questionAttempt.create({
      data: {
        sessionId,
        moduleId,
        questionId: qid,
        questionVersion: qData?.version || 1,
        selectedAnswer: submitted?.selectedAnswer || null,
        isAnswered,
        isCorrect,
        responseTimeMs,
        isTimedOut,
        errorCategory: errorEval.category as any,
      },
    });
  }
}

/**
 * Calculates complete or partial session metrics from persisted attempts.
 */
export async function computeSessionMetricsFromDb(
  sessionId: string
): Promise<CalculatedSessionResults> {
  const allAttempts = await prisma.questionAttempt.findMany({
    where: { sessionId },
    include: {
      question: true,
      module: true,
    },
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

  return calculateSessionMetrics(attemptInputs, timeoutsCount);
}
