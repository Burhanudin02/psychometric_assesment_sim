export type SpeedAccuracyQuadrant =
  | "FAST_ACCURATE"
  | "FAST_INACCURATE"
  | "SLOW_ACCURATE"
  | "SLOW_INACCURATE";

export interface QuadrantEvaluation {
  quadrant: SpeedAccuracyQuadrant;
  label: string;
  description: string;
  recommendation: string;
}

export const ACCURACY_THRESHOLD = 75.0; // 75% accuracy separates accurate vs inaccurate
export const DEFAULT_SPEED_THRESHOLD_SEC = 8.0; // 8.0 seconds median response time benchmark

export function evaluateQuadrant(
  accuracyPct: number,
  medianResponseTimeSec: number,
  speedThresholdSec: number = DEFAULT_SPEED_THRESHOLD_SEC
): QuadrantEvaluation {
  const isAccurate = accuracyPct >= ACCURACY_THRESHOLD;
  const isFast = medianResponseTimeSec <= speedThresholdSec;

  if (isFast && isAccurate) {
    return {
      quadrant: "FAST_ACCURATE",
      label: "Cepat & Akurat (Fast + Accurate)",
      description: "Performa optimal: pemahaman konsep tinggi dengan kecepatan eksekusi yang sangat efisien di bawah tekanan waktu.",
      recommendation: "Pertahankan ketenangan mental dan fokus mempertahankan konsistensi kecepatan pada modul-modul akhir.",
    };
  }

  if (isFast && !isAccurate) {
    return {
      quadrant: "FAST_INACCURATE",
      label: "Cepat Namun Kurang Teliti (Fast + Inaccurate)",
      description: "Kecenderungan impulsif: merespons sangat cepat namun sering terjebak oleh opsi pengalih (distractor) atau salah kalkulasi.",
      recommendation: "Perlambat 2-3 detik pada tahap verifikasi jawaban. Periksa kembali aturan pola sebelum menekan pilihan jawaban.",
    };
  }

  if (!isFast && isAccurate) {
    return {
      quadrant: "SLOW_ACCURATE",
      label: "Akurat Namun Lambat (Slow + Accurate)",
      description: "Kecenderungan perfeksionis: tingkat ketelitian sangat baik, namun berisiko kehabisan waktu pada tes berkecepatan tinggi.",
      recommendation: "Gunakan teknik eliminasi cepat. Jangan habiskan waktu lebih dari target pace modul untuk satu soal yang rumit.",
    };
  }

  return {
    quadrant: "SLOW_INACCURATE",
    label: "Lambat & Perlu Peningkatan Akurasi (Slow + Inaccurate)",
    description: "Tantangan ganda: membutuhkan waktu berpikir lama dan masih sering mengalami kesalahan penalaran pada domain ini.",
    recommendation: "Lakukan latihan deliberate practice terfokus tanpa batas waktu terlebih dahulu untuk memantapkan konsep dasar domain ini.",
  };
}
