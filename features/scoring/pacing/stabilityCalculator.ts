import { ModulePerformanceItem } from "./types";

/**
 * Calculates stability score (0-100) based on accuracy standard deviation across attempted modules.
 */
export function calculateStabilityScore(
  attemptedModules: ModulePerformanceItem[],
  overallAccuracy: number
): number {
  if (attemptedModules.length < 2) {
    return 100;
  }

  const variance =
    attemptedModules.reduce((acc, m) => acc + Math.pow((m.accuracy ?? 0) - overallAccuracy, 2), 0) /
    attemptedModules.length;
  const stdDev = Math.sqrt(variance);

  // Score from 100 down to 0: stdDev <= 5 -> 100, stdDev >= 25 -> 0
  const stability = Math.max(0, Math.min(100, 100 - (stdDev / 25) * 100));
  return Number(stability.toFixed(0));
}
