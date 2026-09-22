import React from "react";
import { PacingMetricsSummary } from "@/features/scoring/pacingMetrics";

interface PacingKpiCardsProps {
  summary: PacingMetricsSummary;
}

export function PacingKpiCards({ summary }: PacingKpiCardsProps) {
  const {
    overallAccuracy,
    attemptedModuleCount,
    overallMedianResponseTimeMs,
    baselineMedianResponseTimeMs,
    totalTimeouts,
    deltaAccuracyPp,
    stabilityScore,
  } = summary;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* KPI 1: Akurasi Rata-rata */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Rata-rata Akurasi
        </span>
        <div className="flex items-baseline space-x-1.5 mt-2">
          <span className="text-2xl font-extrabold text-slate-900">{overallAccuracy}%</span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1">
          Dari {attemptedModuleCount} modul dikerjakan
        </span>
      </div>

      {/* KPI 2: Median Kecepatan */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Median Waktu Respon
        </span>
        <div className="flex items-baseline space-x-1.5 mt-2">
          <span className="text-2xl font-extrabold text-slate-900">
            {(overallMedianResponseTimeMs / 1000).toFixed(1)}s
          </span>
          <span className="text-xs text-slate-500 font-medium">/soal</span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1">
          Baseline: {baselineMedianResponseTimeMs ? (baselineMedianResponseTimeMs / 1000).toFixed(1) : "-"}s
        </span>
      </div>

      {/* KPI 3: Modul Timeout */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Kehabisan Waktu
        </span>
        <div className="flex items-baseline space-x-1.5 mt-2">
          <span
            className={`text-2xl font-extrabold ${
              totalTimeouts > 0 ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {totalTimeouts}
          </span>
          <span className="text-xs text-slate-500 font-medium">modul</span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1">
          {totalTimeouts === 0 ? "Semua selesai sebelum 60s" : "Waktu 60s habis sebelum rampung"}
        </span>
      </div>

      {/* KPI 4: Selisih Fase Akhir vs Awal */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Perubahan Akhir vs Awal
        </span>
        <div className="flex items-baseline space-x-1.5 mt-2">
          {deltaAccuracyPp !== null ? (
            <span
              className={`text-2xl font-extrabold flex items-center ${
                deltaAccuracyPp >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {deltaAccuracyPp >= 0 ? `+${deltaAccuracyPp}` : deltaAccuracyPp}
              <span className="text-sm font-semibold ml-0.5">pp</span>
            </span>
          ) : (
            <span className="text-2xl font-extrabold text-slate-400">N/A</span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-1">
          M15–M21 vs M01–M07
        </span>
      </div>

      {/* KPI 5: Indeks Stabilitas */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between col-span-2 sm:col-span-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Indeks Stabilitas
        </span>
        <div className="flex items-baseline space-x-1.5 mt-2">
          <span className="text-2xl font-extrabold text-blue-700">{stabilityScore}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1">
          {stabilityScore >= 80 ? "Konsistensi tinggi" : "Fluktuasi moderat"}
        </span>
      </div>
    </div>
  );
}
