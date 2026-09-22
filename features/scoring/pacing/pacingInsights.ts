import {
  ModulePerformanceItem,
  PacingPhaseMetrics,
  PerformanceDropInfo,
  LateRecoveryInfo,
} from "./types";

interface InsightInput {
  attemptedCount: number;
  overallAccuracy: number;
  overallMedianResponseTimeMs: number;
  totalTimeouts: number;
  stabilityScore: number;
  earlyPhase: PacingPhaseMetrics;
  latePhase: PacingPhaseMetrics;
  deltaAccuracyPp: number | null;
  deltaResponseTimeSec: number | null;
  largestDrop: PerformanceDropInfo | null;
  recovery: LateRecoveryInfo | null;
  modules: ModulePerformanceItem[];
}

/**
 * Generates descriptive, neutral text insights based on pacing and accuracy telemetry.
 */
export function generatePacingInsights(input: InsightInput): string[] {
  const {
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
  } = input;

  const insights: string[] = [];

  // Insight 1: General pacing efficiency
  const paceSec = overallMedianResponseTimeMs / 1000;
  if (paceSec <= 6.5) {
    insights.push(
      `Laju pengerjaan sangat cepat (median ${paceSec.toFixed(1)} detik/soal). ` +
        (overallAccuracy >= 75
          ? "Kecepatan tinggi diimbangi dengan akurasi yang solid."
          : "Waspadai potensi kesalahan terburu-buru (speed-accuracy tradeoff).")
    );
  } else if (paceSec <= 9.0) {
    insights.push(
      `Tempo pengerjaan tergolong terukur dan stabil (median ${paceSec.toFixed(1)} detik/soal).`
    );
  } else {
    insights.push(
      `Kandidat cenderung berhati-hati dan memerlukan waktu analisis lebih mendalam (median ${paceSec.toFixed(1)} detik/soal). ` +
        (totalTimeouts > 0 ? "Perlu strategi pembagian waktu agar tidak kehabisan waktu di modul bertekanan tinggi." : "")
    );
  }

  // Insight 2: Early vs Late delta & Fatigue
  if (deltaAccuracyPp !== null) {
    if (deltaAccuracyPp <= -15.0) {
      insights.push(
        `Terlihat indikasi penurunan daya tahan konsentrasi (fatigue decay) di sepertiga akhir tes, dengan penurunan akurasi sebesar ${Math.abs(deltaAccuracyPp)} pp pada M15–M21 dibanding M01–M07.`
      );
    } else if (deltaAccuracyPp >= 10.0) {
      insights.push(
        `Terlihat efek adaptasi positif (warm-up gain): akurasi pada modul akhir meningkat +${deltaAccuracyPp} pp dibanding modul awal.`
      );
    } else {
      insights.push(
        `Stamina kognitif relatif konsisten antara fase awal dan fase akhir (selisih akurasi hanya ${Math.abs(deltaAccuracyPp)} pp).`
      );
    }
  }

  // Insight 3: Specific largest drop callout
  if (largestDrop) {
    insights.push(
      `Penurunan performa paling tajam terjadi pada perpindahan ke ${largestDrop.toTitle}: ${largestDrop.description}.`
    );
  }

  // Insight 4: Late Recovery callout
  if (recovery && recovery.hasRecovered) {
    insights.push(recovery.description);
  }

  // Insight 5: Timeouts context
  if (totalTimeouts > 0) {
    const timedOutMods = modules.filter((m) => m.timedOut).map((m) => `M${String(m.moduleNumber).padStart(2, "0")}`);
    insights.push(
      `Terdapat ${totalTimeouts} modul yang terhenti otomatis karena batas waktu 60 detik habis (${timedOutMods.join(", ")}).`
    );
  }

  return insights;
}
