import { getCurriculumBlueprint, getModuleConfig, DOMAIN_LABELS } from "@/lib/curriculum";
import { calculateMedian } from "./calculator";

export interface ModulePerformanceItem {
  moduleNumber: number;
  title: string;
  domain: string;
  domainLabel: string;
  subtopic: string;
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number | null; // null if not attempted
  medianResponseTimeMs: number | null; // null if not attempted
  averageResponseTimeMs: number | null;
  timedOut: boolean;
  isAttempted: boolean;
}

export interface PacingPhaseMetrics {
  name: string;
  rangeLabel: string;
  moduleNumbers: number[];
  attemptedCount: number;
  accuracy: number | null;
  medianResponseTimeMs: number | null;
  timeoutCount: number;
}

export interface PerformanceDropInfo {
  fromModule: number;
  toModule: number;
  fromTitle: string;
  toTitle: string;
  accuracyDropPp: number;
  speedSlowdownSec: number;
  combinedDropScore: number;
  description: string;
}

export interface LateRecoveryInfo {
  hasRecovered: boolean;
  recoveryDeltaPp: number;
  description: string;
}

export interface PacingMetricsSummary {
  modules: ModulePerformanceItem[];
  // Baseline (M01-M05 or attempted up to 5)
  baselineModuleCount: number;
  baselineAccuracy: number | null;
  baselineMedianResponseTimeMs: number | null;
  // Phases
  earlyPhase: PacingPhaseMetrics; // M01-M07
  middlePhase: PacingPhaseMetrics; // M08-M14
  latePhase: PacingPhaseMetrics; // M15-M21
  // Early vs Late Comparison
  deltaAccuracyPp: number | null;
  deltaResponseTimeSec: number | null;
  deltaTimeoutCount: number;
  // Drop and Recovery Detection
  largestDrop: PerformanceDropInfo | null;
  recovery: LateRecoveryInfo | null;
  // Overall Summary across attempted modules
  attemptedModuleCount: number;
  overallAccuracy: number;
  overallMedianResponseTimeMs: number;
  totalTimeouts: number;
  stabilityScore: number; // 0-100 (100 = perfectly consistent accuracy)
  // Automated neutral text insights
  insights: string[];
}

export interface RawAttemptLike {
  moduleNumber: number;
  domain?: string;
  isAnswered: boolean;
  isCorrect: boolean;
  responseTimeMs: number;
  isTimedOut: boolean;
}

export function computePacingMetrics(
  attempts: RawAttemptLike[],
  totalCurriculumModules: number = 21,
  baselineK: number = 5
): PacingMetricsSummary {
  const blueprint = getCurriculumBlueprint();

  // Group attempts by moduleNumber
  const moduleMap = new Map<number, RawAttemptLike[]>();
  for (const att of attempts) {
    const list = moduleMap.get(att.moduleNumber) || [];
    list.push(att);
    moduleMap.set(att.moduleNumber, list);
  }

  // Build full module items (1..totalCurriculumModules)
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

  const attemptedModules = modules.filter((m) => m.isAttempted && m.accuracy !== null);
  const attemptedCount = attemptedModules.length;

  // 1. Baseline (M01-M05)
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

  // Helper for Phase Metrics
  function computePhase(
    name: string,
    rangeLabel: string,
    startMod: number,
    endMod: number
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

  const earlyPhase = computePhase("Fase Awal", "M01–M07", 1, 7);
  const middlePhase = computePhase("Fase Tengah", "M08–M14", 8, 14);
  const latePhase = computePhase("Fase Akhir", "M15–M21", 15, 21);

  // 2. Early vs Late Comparison
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

  // 3. Largest Drop Detection across consecutive attempted modules
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

  // 4. Late Recovery Detection
  // Check if late segment (M19-M21) shows significant accuracy rebound compared to mid-late dip (M12-M18)
  let recovery: LateRecoveryInfo | null = null;
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
      recovery = {
        hasRecovered: true,
        recoveryDeltaPp: recDelta,
        description: `Terjadi peningkatan performa kembali (recovery) sebesar +${recDelta} pp pada modul akhir (M18–M21) dibandingkan fase transisi tengah (M12–M17).`,
      };
    }
  }

  // 5. Overall Metrics & Stability Score
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

  // Stability Score (100 - standard deviation of module accuracies)
  let stabilityScore = 100;
  if (attemptedCount > 1) {
    const accuracies = attemptedModules.map((m) => m.accuracy ?? 0);
    const mean = accuracies.reduce((s, a) => s + a, 0) / accuracies.length;
    const variance =
      accuracies.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / accuracies.length;
    const stdDev = Math.sqrt(variance);
    stabilityScore = Math.max(0, Math.min(100, Number((100 - stdDev).toFixed(1))));
  }

  // 6. Automated Neutral Text Insights
  const insights: string[] = [];

  // Insight A: Baseline Reference
  if (baselineAccuracy !== null && baselineMedianResponseTimeMs !== null) {
    const baseSec = (baselineMedianResponseTimeMs / 1000).toFixed(1);
    insights.push(
      `Baseline performa awal (5 modul pertama) berada pada akurasi ${baselineAccuracy}% dengan median waktu respon ${baseSec} detik/soal.`
    );
  }

  // Insight B: Early vs Late Comparison
  if (deltaAccuracyPp !== null && deltaResponseTimeSec !== null) {
    if (deltaAccuracyPp < -12.0) {
      insights.push(
        `Terjadi penurunan akurasi sebesar ${Math.abs(deltaAccuracyPp)} pp pada fase akhir (M15–M21) dibandingkan fase awal (M01–M07).`
      );
    } else if (deltaAccuracyPp > 8.0) {
      insights.push(
        `Akurasi meningkat +${deltaAccuracyPp} pp pada fase akhir (M15–M21) dibandingkan fase awal, menunjukkan adaptasi ritme pengerjaan yang efektif.`
      );
    } else {
      insights.push(
        `Akurasi pengerjaan relatif stabil dengan variasi hanya ${Math.abs(deltaAccuracyPp)} pp antara fase awal dan akhir.`
      );
    }

    if (deltaResponseTimeSec > 2.5) {
      insights.push(
        `Waktu respon rata-rata melambat +${deltaResponseTimeSec} detik/soal pada fase akhir, mengindikasikan peningkatan kehati-hatian atau beban komputasi mental yang lebih berat.`
      );
    } else if (deltaResponseTimeSec < -2.0) {
      insights.push(
        `Laju pengerjaan bertambah cepat ${Math.abs(deltaResponseTimeSec)} detik/soal pada modul-modul akhir.`
      );
    }
  }

  // Insight C: Timeout Analysis
  if (totalTimeouts > 0) {
    const timeoutDetails: string[] = [];
    if (earlyPhase.timeoutCount > 0) timeoutDetails.push(`${earlyPhase.timeoutCount} di fase awal`);
    if (middlePhase.timeoutCount > 0) timeoutDetails.push(`${middlePhase.timeoutCount} di fase tengah`);
    if (latePhase.timeoutCount > 0) timeoutDetails.push(`${latePhase.timeoutCount} di fase akhir`);

    insights.push(
      `Tercatat kehabisan waktu (timeout) pada ${totalTimeouts} modul (${timeoutDetails.join(", ")}). Perhatikan pembagian batas waktu 60 detik per modul.`
    );
  } else {
    insights.push(
      `Manajemen waktu optimal: tidak ada modul yang mengalami timeout di sepanjang 21 subtes.`
    );
  }

  // Insight D: Drop Transition
  if (largestDrop) {
    insights.push(
      `Penurunan performa paling tajam teridentifikasi pada transisi Modul ${String(largestDrop.fromModule).padStart(2, "0")} ke Modul ${String(largestDrop.toModule).padStart(2, "0")} (${largestDrop.description}).`
    );
  }

  // Insight E: Recovery
  if (recovery?.hasRecovered) {
    insights.push(recovery.description);
  }

  return {
    modules,
    baselineModuleCount: baselineCandidates.length,
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

export function generatePacingCsv(modules: ModulePerformanceItem[]): string {
  const headers = [
    "No Modul",
    "Judul Modul",
    "Domain",
    "Subtopik",
    "Status",
    "Total Soal",
    "Terjawab",
    "Benar",
    "Salah",
    "Kosong",
    "Akurasi (%)",
    "Median Waktu (s)",
    "Rata-rata Waktu (s)",
    "Timeout",
  ];

  const rows = modules.map((m) => [
    m.moduleNumber,
    `"${m.title.replace(/"/g, '""')}"`,
    `"${m.domainLabel.replace(/"/g, '""')}"`,
    `"${m.subtopic.replace(/"/g, '""')}"`,
    m.isAttempted ? "Dikerjakan" : "Belum Dikerjakan",
    m.total,
    m.answered,
    m.correct,
    m.incorrect,
    m.unanswered,
    m.accuracy !== null ? m.accuracy : "N/A",
    m.medianResponseTimeMs !== null ? (m.medianResponseTimeMs / 1000).toFixed(2) : "N/A",
    m.averageResponseTimeMs !== null ? (m.averageResponseTimeMs / 1000).toFixed(2) : "N/A",
    m.timedOut ? "Ya" : "Tidak",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
