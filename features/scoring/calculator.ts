import { evaluateQuadrant, SpeedAccuracyQuadrant } from "./quadrantMatrix";
import { analyzeFatigue } from "./fatigueAnalyzer";

export interface AttemptInput {
  questionId: string;
  moduleId: string;
  moduleNumber: number;
  domain: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  isAnswered: boolean;
  responseTimeMs: number;
  isTimedOut: boolean;
}

export interface DomainScoreSummary {
  domain: string;
  totalItems: number;
  attempted: number;
  correct: number;
  accuracy: number;
  averageResponseTimeMs: number;
  medianResponseTimeMs: number;
  timeoutRate: number;
  quadrant: SpeedAccuracyQuadrant;
  quadrantLabel: string;
}

export interface CalculatedSessionResults {
  totalQuestions: number;
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  accuracy: number;
  effectivePaceRate: number;
  averageResponseTimeMs: number;
  medianResponseTimeMs: number;
  timeoutCount: number;
  speedScore: number;
  consistencyScore: number;
  fatigueIndex: number;
  speedAccuracyCategory: SpeedAccuracyQuadrant;
  domainScores: DomainScoreSummary[];
  moduleBreakdown: {
    moduleNumber: number;
    total: number;
    correct: number;
    accuracy: number;
    medianResponseTimeMs: number;
    timedOut: boolean;
  }[];
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateSessionMetrics(
  attempts: AttemptInput[],
  moduleTimeoutCount: number = 0
): CalculatedSessionResults {
  const totalQuestions = attempts.length;
  const totalAnswered = attempts.filter((a) => a.isAnswered).length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const totalIncorrect = attempts.filter((a) => a.isAnswered && !a.isCorrect).length;
  const totalUnanswered = attempts.filter((a) => !a.isAnswered).length;

  const accuracy = totalAnswered > 0 ? Number(((totalCorrect / totalAnswered) * 100).toFixed(1)) : 0;

  const responseTimes = attempts
    .filter((a) => a.isAnswered && a.responseTimeMs > 0)
    .map((a) => a.responseTimeMs);

  const averageResponseTimeMs =
    responseTimes.length > 0
      ? Number((responseTimes.reduce((acc, t) => acc + t, 0) / responseTimes.length).toFixed(0))
      : 0;

  const medianResponseTimeMs = Number(calculateMedian(responseTimes).toFixed(0));

  const totalTimeSeconds = responseTimes.reduce((acc, t) => acc + t, 0) / 1000;
  const totalMinutes = Math.max(0.5, totalTimeSeconds / 60);
  const effectivePaceRate = Number((totalAnswered / totalMinutes).toFixed(1));

  // Speed Score (0-100 scale: 100 if median <= 5s, drops progressively if median > 15s)
  const medianSec = medianResponseTimeMs / 1000;
  const speedScore = Number(
    Math.min(100, Math.max(0, 100 * (8.0 / Math.max(1.0, medianSec)))).toFixed(1)
  );

  // Group by Module for Fatigue and Consistency
  const modulesMap = new Map<number, AttemptInput[]>();
  for (const att of attempts) {
    const arr = modulesMap.get(att.moduleNumber) || [];
    arr.push(att);
    modulesMap.set(att.moduleNumber, arr);
  }

  const moduleBreakdown = Array.from(modulesMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([modNum, modAttempts]) => {
      const answered = modAttempts.filter((a) => a.isAnswered);
      const correct = modAttempts.filter((a) => a.isCorrect).length;
      const modAcc = answered.length > 0 ? (correct / answered.length) * 100 : 0;
      const times = answered.map((a) => a.responseTimeMs);
      const isTimedOut = modAttempts.some((a) => a.isTimedOut);

      return {
        moduleNumber: modNum,
        total: modAttempts.length,
        correct,
        accuracy: Number(modAcc.toFixed(1)),
        medianResponseTimeMs: calculateMedian(times),
        timedOut: isTimedOut,
      };
    });

  // Fatigue calculation
  const fatigue = analyzeFatigue(
    moduleBreakdown.map((m) => ({ moduleNumber: m.moduleNumber, accuracy: m.accuracy }))
  );

  // Consistency Score: standard deviation of module accuracies
  let consistencyScore = 100;
  if (moduleBreakdown.length > 1) {
    const meanAcc = moduleBreakdown.reduce((sum, m) => sum + m.accuracy, 0) / moduleBreakdown.length;
    const variance =
      moduleBreakdown.reduce((sum, m) => sum + Math.pow(m.accuracy - meanAcc, 2), 0) /
      moduleBreakdown.length;
    const stdDev = Math.sqrt(variance);
    consistencyScore = Math.max(0, Math.min(100, Number((100 - stdDev).toFixed(1))));
  }

  // Domain breakdown
  const domainMap = new Map<string, AttemptInput[]>();
  for (const att of attempts) {
    const list = domainMap.get(att.domain) || [];
    list.push(att);
    domainMap.set(att.domain, list);
  }

  const domainScores: DomainScoreSummary[] = Array.from(domainMap.entries()).map(
    ([domain, dAttempts]) => {
      const attempted = dAttempts.filter((a) => a.isAnswered).length;
      const correct = dAttempts.filter((a) => a.isCorrect).length;
      const domainAcc = attempted > 0 ? Number(((correct / attempted) * 100).toFixed(1)) : 0;
      const dTimes = dAttempts.filter((a) => a.isAnswered).map((a) => a.responseTimeMs);
      const avgTime = dTimes.length ? dTimes.reduce((s, t) => s + t, 0) / dTimes.length : 0;
      const medTime = calculateMedian(dTimes);
      const timedOutItems = dAttempts.filter((a) => a.isTimedOut).length;
      const timeoutRate = dAttempts.length > 0 ? Number(((timedOutItems / dAttempts.length) * 100).toFixed(1)) : 0;

      const quad = evaluateQuadrant(domainAcc, medTime / 1000);

      return {
        domain,
        totalItems: dAttempts.length,
        attempted,
        correct,
        accuracy: domainAcc,
        averageResponseTimeMs: Number(avgTime.toFixed(0)),
        medianResponseTimeMs: Number(medTime.toFixed(0)),
        timeoutRate,
        quadrant: quad.quadrant,
        quadrantLabel: quad.label,
      };
    }
  );

  const globalQuadrant = evaluateQuadrant(accuracy, medianSec);

  return {
    totalQuestions,
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    totalUnanswered,
    accuracy,
    effectivePaceRate,
    averageResponseTimeMs,
    medianResponseTimeMs,
    timeoutCount: moduleTimeoutCount,
    speedScore,
    consistencyScore,
    fatigueIndex: fatigue.fatigueIndex,
    speedAccuracyCategory: globalQuadrant.quadrant,
    domainScores,
    moduleBreakdown,
  };
}
