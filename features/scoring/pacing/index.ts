import { calculateMedian } from "../calculator";
import {
  ModulePerformanceItem,
  PacingPhaseMetrics,
  PerformanceDropInfo,
  LateRecoveryInfo,
  PacingMetricsSummary,
  RawAttemptLike,
} from "./types";
import {
  buildModulePerformanceItems,
  calculateBaselineMetrics,
  aggregatePhaseMetrics,
} from "./pacingAggregator";
import { detectLargestPerformanceDrop } from "./dropDetection";
import { detectLateRecovery } from "./recoveryDetection";
import { calculateStabilityScore } from "./stabilityCalculator";
import { generatePacingInsights } from "./pacingInsights";
import { generatePacingCsv } from "./pacingCsvExporter";

export * from "./types";
export { generatePacingCsv };

/**
 * High-level orchestration function to compute longitudinal pacing metrics across all modules.
 */
export function computePacingMetrics(
  attempts: RawAttemptLike[],
  totalCurriculumModules: number = 21,
  baselineK: number = 5
): PacingMetricsSummary {
  // 1. Build module list
  const modules = buildModulePerformanceItems(attempts, totalCurriculumModules);
  const attemptedModules = modules.filter((m) => m.isAttempted && m.accuracy !== null);
  const attemptedCount = attemptedModules.length;

  // 2. Baseline Metrics (M01-M05)
  const { baselineAccuracy, baselineMedianResponseTimeMs, baselineModuleCount } =
    calculateBaselineMetrics(modules, attempts, baselineK);

  // 3. Phase Metrics
  const earlyPhase = aggregatePhaseMetrics("Fase Awal", "M01–M07", 1, 7, modules, attempts);
  const middlePhase = aggregatePhaseMetrics("Fase Tengah", "M08–M14", 8, 14, modules, attempts);
  const latePhase = aggregatePhaseMetrics("Fase Akhir", "M15–M21", 15, 21, modules, attempts);

  // 4. Early vs Late Deltas
  let deltaAccuracyPp: number | null = null;
  let deltaResponseTimeSec: number | null = null;
  const deltaTimeoutCount = latePhase.timeoutCount - earlyPhase.timeoutCount;

  if (earlyPhase.accuracy !== null && latePhase.accuracy !== null) {
    deltaAccuracyPp = Number((latePhase.accuracy - earlyPhase.accuracy).toFixed(1));
  }

  if (
    earlyPhase.medianResponseTimeMs !== null &&
    latePhase.medianResponseTimeMs !== null
  ) {
    deltaResponseTimeSec = Number(
      ((latePhase.medianResponseTimeMs - earlyPhase.medianResponseTimeMs) / 1000).toFixed(2)
    );
  }

  // 5. Drop and Recovery Detection
  const largestDrop = detectLargestPerformanceDrop(attemptedModules);
  const recovery = detectLateRecovery(modules);

  // 6. Overall Metrics & Stability Score
  const allAnswered = attempts.filter((a) => a.isAnswered);
  const allCorrect = attempts.filter((a) => a.isCorrect);
  const overallAccuracy =
    allAnswered.length > 0
      ? Number(((allCorrect.length / allAnswered.length) * 100).toFixed(1))
      : 0;

  const allTimes = allAnswered
    .map((a) => a.responseTimeMs)
    .filter((t) => t > 0);
  const overallMedianResponseTimeMs =
    allTimes.length > 0 ? Number(calculateMedian(allTimes).toFixed(0)) : 0;

  const totalTimeouts = modules.filter((m) => m.timedOut).length;
  const stabilityScore = calculateStabilityScore(attemptedModules, overallAccuracy);

  // 7. Generate Insights
  const insights = generatePacingInsights({
    attemptedCount,
    overallAccuracy,
    overallMedianResponseTimeMs,
    totalTimeouts,
    stabilityScore,
    earlyPhase,
    latePhase,
    deltaAccuracyPp,
    deltaResponseTimeSec,
    largestDrop,
    recovery,
    modules,
  });

  return {
    modules,
    baselineModuleCount,
    baselineAccuracy,
    baselineMedianResponseTimeMs,
    earlyPhase,
    middlePhase,
    latePhase,
    deltaAccuracyPp,
    deltaResponseTimeSec,
    deltaTimeoutCount,
    largestDrop,
    recovery,
    attemptedModuleCount: attemptedCount,
    overallAccuracy,
    overallMedianResponseTimeMs,
    totalTimeouts,
    stabilityScore,
    insights,
  };
}
