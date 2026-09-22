import { ModulePerformanceItem, LateRecoveryInfo } from "./types";

/**
 * Detects whether late modules exhibit performance recovery compared to mid-test dips.
 */
export function detectLateRecovery(
  modules: ModulePerformanceItem[]
): LateRecoveryInfo | null {
  const dipMods = modules.filter(
    (m) => m.moduleNumber >= 12 && m.moduleNumber <= 17 && m.isAttempted && m.accuracy !== null
  );
  const endMods = modules.filter(
    (m) => m.moduleNumber >= 18 && m.moduleNumber <= 21 && m.isAttempted && m.accuracy !== null
  );

  if (dipMods.length >= 2 && endMods.length >= 2) {
    const dipAvg = dipMods.reduce((s, m) => s + (m.accuracy ?? 0), 0) / dipMods.length;
    const endAvg = endMods.reduce((s, m) => s + (m.accuracy ?? 0), 0) / endMods.length;
    const recDelta = Number((endAvg - dipAvg).toFixed(1));

    if (recDelta >= 8.0) {
      return {
        hasRecovered: true,
        recoveryDeltaPp: recDelta,
        description: `Terjadi peningkatan performa kembali (recovery) sebesar +${recDelta} pp pada modul akhir (M18–M21) dibandingkan fase transisi tengah (M12–M17).`,
      };
    }
  }

  return null;
}
