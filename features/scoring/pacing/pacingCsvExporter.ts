import { ModulePerformanceItem } from "./types";

/**
 * Generates RFC 4180 compliant CSV content from a list of module performance items.
 */
export function generatePacingCsv(modules: ModulePerformanceItem[]): string {
  const headers = [
    "Nomor Modul",
    "Judul Modul",
    "Domain Kognitif",
    "Subtopik",
    "Total Soal",
    "Terjawab",
    "Benar",
    "Salah",
    "Tidak Terjawab",
    "Akurasi (%)",
    "Median Waktu (ms)",
    "Rata-rata Waktu (ms)",
    "Status Timeout",
    "Dikerjakan",
  ];

  const rows = modules.map((m) => [
    m.moduleNumber,
    `"${m.title.replace(/"/g, '""')}"`,
    `"${m.domainLabel.replace(/"/g, '""')}"`,
    `"${m.subtopic.replace(/"/g, '""')}"`,
    m.total,
    m.answered,
    m.correct,
    m.incorrect,
    m.unanswered,
    m.accuracy !== null ? m.accuracy : "N/A",
    m.medianResponseTimeMs !== null ? m.medianResponseTimeMs : "N/A",
    m.averageResponseTimeMs !== null ? m.averageResponseTimeMs : "N/A",
    m.timedOut ? "TIMEOUT" : "SELESAI",
    m.isAttempted ? "YA" : "TIDAK",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
