import { getAllQuestions } from "@/features/questions/repository";
import { QuestionItem } from "@/features/questions/types";

export interface CalibrationResultItem {
  domain: string;
  total: number;
  correct: number;
  rating: "Kuat (Strong)" | "Cukup (Moderate)" | "Perlu Peningkatan (Weak)";
}

export async function getCalibrationQuestions(): Promise<QuestionItem[]> {
  const all = await getAllQuestions();
  const domains = [
    "NUMERICAL_REASONING",
    "NUMBER_SERIES",
    "VERBAL_REASONING",
    "LOGICAL_REASONING",
    "ABSTRACT_REASONING",
    "SPATIAL_REASONING",
    "ATTENTION_CONCENTRATION",
    "SPEED_ACCURACY",
  ];

  const selected: QuestionItem[] = [];
  for (const dom of domains) {
    const pool = all.filter((q) => q.domain === dom);
    if (pool.length > 0) {
      selected.push(pool[0]);
    }
  }

  // Add 2 more to reach exactly 10 questions
  const extraPool = all.filter((q) => !selected.includes(q));
  if (extraPool.length >= 2) {
    selected.push(extraPool[0], extraPool[1]);
  }

  return selected.slice(0, 10);
}

export function evaluateCalibration(
  attempts: { domain: string; isCorrect: boolean }[]
): {
  overallScore: number;
  domainRatings: CalibrationResultItem[];
  diagnosticSummary: string;
} {
  const domainMap = new Map<string, { total: number; correct: number }>();

  for (const att of attempts) {
    const cur = domainMap.get(att.domain) || { total: 0, correct: 0 };
    cur.total += 1;
    if (att.isCorrect) cur.correct += 1;
    domainMap.set(att.domain, cur);
  }

  const domainRatings: CalibrationResultItem[] = Array.from(domainMap.entries()).map(
    ([domain, data]) => {
      const pct = (data.correct / data.total) * 100;
      let rating: "Kuat (Strong)" | "Cukup (Moderate)" | "Perlu Peningkatan (Weak)" = "Perlu Peningkatan (Weak)";
      if (pct >= 80) rating = "Kuat (Strong)";
      else if (pct >= 50) rating = "Cukup (Moderate)";

      return {
        domain,
        total: data.total,
        correct: data.correct,
        rating,
      };
    }
  );

  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const overallScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return {
    overallScore,
    domainRatings,
    diagnosticSummary:
      "Profil kognitif awal Anda telah dikalibrasi berdasarkan 10 butir soal uji diagnostik. Gunakan hasil ini sebagai rekomendasi latihan terarah sebelum memulai Simulasi 21 Modul penuh.",
  };
}
