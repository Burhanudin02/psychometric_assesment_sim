export type ErrorCategory =
  | "TIMEOUT_UNANSWERED"
  | "ARITHMETIC_ERROR"
  | "PATTERN_MISRECOGNITION"
  | "RULE_MISUNDERSTANDING"
  | "DISTRACTOR_SELECTION"
  | "SPATIAL_ORIENTATION_ERROR"
  | "CARELESS_RAPID_ERROR"
  | "NONE";

export interface ErrorClassificationResult {
  category: ErrorCategory;
  label: string;
  description: string;
  remedyTip: string;
}

export function classifyError(params: {
  isCorrect: boolean;
  isAnswered: boolean;
  isTimedOut: boolean;
  responseTimeMs: number;
  domain: string;
  subtopic?: string;
}): ErrorClassificationResult {
  if (params.isCorrect) {
    return {
      category: "NONE",
      label: "Benar",
      description: "Jawaban tepat dan terverifikasi.",
      remedyTip: "Pertahankan ketelitian dan kecepatan.",
    };
  }

  if (!params.isAnswered || params.isTimedOut) {
    return {
      category: "TIMEOUT_UNANSWERED",
      label: "Kehabisan Waktu / Tidak Terjawab",
      description: "Waktu modul 60 detik habis sebelum Anda sempat memilih jawaban untuk soal ini.",
      remedyTip: "Terapkan batas waktu maksimal (pacing) per soal. Jika macet lebih dari 10 detik, pilih estimasi terbaik dan lanjutkan ke soal berikutnya.",
    };
  }

  // Answered in less than 1.5 seconds incorrectly
  if (params.responseTimeMs < 1500) {
    return {
      category: "CARELESS_RAPID_ERROR",
      label: "Kesalahan Terburu-buru (Careless Rapid)",
      description: "Anda menjawab dalam waktu sangat singkat (< 1,5 detik) namun kurang teliti.",
      remedyTip: "Gunakan 1-2 detik tambahan untuk memeriksa opsi jawaban sebelum menekan submit.",
    };
  }

  // Domain specific classifications
  if (params.domain === "NUMERICAL_REASONING" || params.domain === "SPEED_ACCURACY") {
    return {
      category: "ARITHMETIC_ERROR",
      label: "Kekeliruan Aritmatika / Hitung",
      description: "Terjadi kesalahan perhitungan matematis, pembulatan, atau urutan operasi hitung.",
      remedyTip: "Gunakan teknik eliminasi angka satuan (last digit check) atau pembulatan cepat.",
    };
  }

  if (params.domain === "NUMBER_SERIES" || params.domain === "ABSTRACT_REASONING") {
    return {
      category: "PATTERN_MISRECOGNITION",
      label: "Salah Mengenali Pola Induktif",
      description: "Aturan perubahan urutan (deret atau bentuk visual) keliru diidentifikasi.",
      remedyTip: "Cek apakah ada pola berselang (interleaved) atau beda bertingkat sebelum menyimpulkan aturan.",
    };
  }

  if (params.domain === "SPATIAL_REASONING") {
    return {
      category: "SPATIAL_ORIENTATION_ERROR",
      label: "Kekeliruan Orientasi Spasial",
      description: "Tertukar antara rotasi kaku 3D dengan pembalikan bayangan cermin (chirality).",
      remedyTip: "Fokus pada hubungan sisi-sisi yang bersebelahan sebagai patokan invariansi orientasi.",
    };
  }

  if (params.domain === "LOGICAL_REASONING") {
    return {
      category: "RULE_MISUNDERSTANDING",
      label: "Pelanggaran Kaidah Deduksi Logika",
      description: "Menarik kesimpulan yang menyimpang dari premis formal atau terjebak asumsi dunia nyata.",
      remedyTip: "Batasi penalaran hanya pada premis tertulis. Hindari menambahkan fakta di luar kalimat premis.",
    };
  }

  return {
    category: "DISTRACTOR_SELECTION",
    label: "Terjebak Pilihan Pengalih (Distractor Trap)",
    description: "Memilih opsi pengecoh yang sekilas tampak benar namun memiliki anomali halus.",
    remedyTip: "Eliminasi dua opsi yang paling tidak mungkin terlebih dahulu untuk menyisakan opsi terbaik.",
  };
}
