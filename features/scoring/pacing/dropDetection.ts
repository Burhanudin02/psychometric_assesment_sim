import { ModulePerformanceItem, PerformanceDropInfo } from "./types";

/**
 * Detects the largest performance drop between consecutive attempted modules.
 */
export function detectLargestPerformanceDrop(
  attemptedModules: ModulePerformanceItem[]
): PerformanceDropInfo | null {
  let largestDrop: PerformanceDropInfo | null = null;
  let maxDropScore = -Infinity;

  for (let i = 0; i < attemptedModules.length - 1; i++) {
    const curr = attemptedModules[i];
    const next = attemptedModules[i + 1];

    if (curr.accuracy === null || next.accuracy === null) continue;

    const accDrop = Number((curr.accuracy - next.accuracy).toFixed(1));
    const currSec = (curr.medianResponseTimeMs || 0) / 1000;
    const nextSec = (next.medianResponseTimeMs || 0) / 1000;
    const timeSlowdown = Number((nextSec - currSec).toFixed(2));

    // Combined drop score: accuracy drop + slowdown impact
    const slowdownBonus = timeSlowdown > 0 ? Math.min(30, timeSlowdown * 3) : 0;
    const combinedScore = accDrop + slowdownBonus;

    if (combinedScore > 12.0 && combinedScore > maxDropScore) {
      maxDropScore = combinedScore;
      let desc = `Akurasi menurun ${accDrop} pp (dari ${curr.accuracy}% ke ${next.accuracy}%)`;
      if (timeSlowdown > 1.0) {
        desc += ` dan durasi pengerjaan melambat +${timeSlowdown}s`;
      } else if (timeSlowdown < -1.0) {
        desc += ` meskipun waktu respon lebih cepat ${Math.abs(timeSlowdown)}s`;
      }
      if (next.timedOut) {
        desc += ` disertai modul kehabisan waktu (timeout)`;
      }

      largestDrop = {
        fromModule: curr.moduleNumber,
        toModule: next.moduleNumber,
        fromTitle: curr.title,
        toTitle: next.title,
        accuracyDropPp: accDrop,
        speedSlowdownSec: timeSlowdown,
        combinedDropScore: Number(combinedScore.toFixed(1)),
        description: desc,
      };
    }
  }

  return largestDrop;
}
