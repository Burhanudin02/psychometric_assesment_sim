import { getCurriculumBlueprint, getModuleConfig, DOMAIN_LABELS } from "@/lib/curriculum";
import { calculateMedian } from "../calculator";
import { ModulePerformanceItem, PacingPhaseMetrics, RawAttemptLike } from "./types";

/**
 * Builds module performance records across all curriculum modules.
 */
export function buildModulePerformanceItems(
  attempts: RawAttemptLike[],
  totalCurriculumModules: number = 21
): ModulePerformanceItem[] {
  const blueprint = getCurriculumBlueprint();

  // Group attempts by moduleNumber
  const moduleMap = new Map<number, RawAttemptLike[]>();
  for (const att of attempts) {
    const list = moduleMap.get(att.moduleNumber) || [];
    list.push(att);
    moduleMap.set(att.moduleNumber, list);
  }

  const modules: ModulePerformanceItem[] = [];

  for (let m = 1; m <= totalCurriculumModules; m++) {
    const config = getModuleConfig(m) || blueprint[m - 1];
    const modAttempts = moduleMap.get(m);
    const title = config?.title || `Modul ${String(m).padStart(2, "0")}`;
    const domain = config?.domain || "GENERAL_COGNITIVE";
    const domainLabel = DOMAIN_LABELS[domain] || domain;
    const subtopic = config?.subtopic || "";
    const defaultTotal = config?.defaultItemCount || 8;

    if (!modAttempts || modAttempts.length === 0) {
      // Unattempted module
      modules.push({
        moduleNumber: m,
        title,
        domain,
        domainLabel,
        subtopic,
        total: defaultTotal,
        answered: 0,
        correct: 0,
        incorrect: 0,
        unanswered: defaultTotal,
        accuracy: null,
        medianResponseTimeMs: null,
        averageResponseTimeMs: null,
        timedOut: false,
        isAttempted: false,
      });
    } else {
      // Attempted module
      const answeredList = modAttempts.filter((a) => a.isAnswered);
      const answeredCount = answeredList.length;
      const correctCount = modAttempts.filter((a) => a.isCorrect).length;
      const incorrectCount = modAttempts.filter((a) => a.isAnswered && !a.isCorrect).length;
      const unansweredCount = modAttempts.filter((a) => !a.isAnswered).length;
      const isTimedOut = modAttempts.some((a) => a.isTimedOut);

      const accuracy =
        answeredCount > 0
          ? Number(((correctCount / answeredCount) * 100).toFixed(1))
          : 0;

      const validTimes = answeredList
        .map((a) => a.responseTimeMs)
        .filter((t) => t > 0);

      const medianTime =
        validTimes.length > 0 ? calculateMedian(validTimes) : (isTimedOut ? 60000 : 0);

      const avgTime =
        validTimes.length > 0
          ? validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length
          : (isTimedOut ? 60000 : 0);

      modules.push({
        moduleNumber: m,
        title,
        domain,
        domainLabel,
        subtopic,
        total: modAttempts.length,
        answered: answeredCount,
        correct: correctCount,
        incorrect: incorrectCount,
        unanswered: unansweredCount,
        accuracy,
        medianResponseTimeMs: Number(medianTime.toFixed(0)),
        averageResponseTimeMs: Number(avgTime.toFixed(0)),
        timedOut: isTimedOut,
        isAttempted: true,
      });
    }
  }

  return modules;
}

/**
 * Calculates baseline accuracy and median response time for initial k modules.
 */
export function calculateBaselineMetrics(
  modules: ModulePerformanceItem[],
  attempts: RawAttemptLike[],
  baselineK: number = 5
): {
  baselineAccuracy: number | null;
  baselineMedianResponseTimeMs: number | null;
  baselineModuleCount: number;
} {
  const baselineCandidates = modules.filter(
    (m) => m.moduleNumber <= baselineK && m.isAttempted && m.accuracy !== null
  );

  let baselineAccuracy: number | null = null;
  let baselineMedianResponseTimeMs: number | null = null;

  if (baselineCandidates.length > 0) {
    const sumAcc = baselineCandidates.reduce((acc, m) => acc + (m.accuracy ?? 0), 0);
    baselineAccuracy = Number((sumAcc / baselineCandidates.length).toFixed(1));

    const baselineTimes = attempts
      .filter((a) => a.moduleNumber <= baselineK && a.isAnswered && a.responseTimeMs > 0)
      .map((a) => a.responseTimeMs);

    baselineMedianResponseTimeMs =
      baselineTimes.length > 0
        ? Number(calculateMedian(baselineTimes).toFixed(0))
        : null;
  }

  return {
    baselineAccuracy,
    baselineMedianResponseTimeMs,
    baselineModuleCount: baselineCandidates.length,
  };
}

/**
 * Aggregates performance metrics across a specified module range (phase).
 */
export function aggregatePhaseMetrics(
  name: string,
  rangeLabel: string,
  startMod: number,
  endMod: number,
  modules: ModulePerformanceItem[],
  attempts: RawAttemptLike[]
): PacingPhaseMetrics {
  const phaseMods = modules.filter(
    (m) => m.moduleNumber >= startMod && m.moduleNumber <= endMod
  );
  const attemptedInPhase = phaseMods.filter((m) => m.isAttempted && m.accuracy !== null);
  const timeouts = phaseMods.filter((m) => m.timedOut).length;

  let phaseAcc: number | null = null;
  let phaseMedTime: number | null = null;

  if (attemptedInPhase.length > 0) {
    const sum = attemptedInPhase.reduce((acc, m) => acc + (m.accuracy ?? 0), 0);
    phaseAcc = Number((sum / attemptedInPhase.length).toFixed(1));

    const phaseTimes = attempts
      .filter(
        (a) =>
          a.moduleNumber >= startMod &&
          a.moduleNumber <= endMod &&
          a.isAnswered &&
          a.responseTimeMs > 0
      )
      .map((a) => a.responseTimeMs);

    phaseMedTime =
      phaseTimes.length > 0
        ? Number(calculateMedian(phaseTimes).toFixed(0))
        : null;
  }

  return {
    name,
    rangeLabel,
    moduleNumbers: phaseMods.map((m) => m.moduleNumber),
    attemptedCount: attemptedInPhase.length,
    accuracy: phaseAcc,
    medianResponseTimeMs: phaseMedTime,
    timeoutCount: timeouts,
  };
}
