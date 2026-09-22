import React from "react";
import { Target, Zap, Clock, AlertTriangle, BarChart3 } from "lucide-react";

interface ResultsMetricsGridProps {
  metrics: {
    totalQuestions: number;
    totalAnswered: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalUnanswered: number;
    accuracy: number;
    effectivePaceRate: number;
    medianResponseTimeMs: number;
    timeoutCount: number;
    consistencyScore?: number;
  };
  pacingStabilityScore?: number;
}

export function ResultsMetricsGrid({
  metrics,
  pacingStabilityScore,
}: ResultsMetricsGridProps) {
  const stability = pacingStabilityScore ?? metrics.consistencyScore ?? 85;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* KPI 1: Akurasi */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
        <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
          <Target className="h-4 w-4 text-blue-600" />
          <span className="text-[11px] font-semibold uppercase">Akurasi Keseluruhan</span>
        </div>
        <div className="flex items-baseline space-x-1 mt-1">
          <span className="text-3xl font-black text-slate-900">{metrics.accuracy}%</span>
        </div>
        <span className="text-[11px] text-slate-400 mt-1">
          {metrics.totalCorrect} benar dari {metrics.totalAnswered} dijawab
        </span>
      </div>

      {/* KPI 2: Laju Efektif */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
        <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="text-[11px] font-semibold uppercase">Laju Pengerjaan</span>
        </div>
        <div className="flex items-baseline space-x-1 mt-1">
          <span className="text-3xl font-black text-slate-900">{metrics.effectivePaceRate}</span>
          <span className="text-xs text-slate-500 font-medium">soal/menit</span>
        </div>
        <span className="text-[11px] text-slate-400 mt-1">Laju pengerjaan efektif</span>
      </div>

      {/* KPI 3: Median Waktu */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
        <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
          <Clock className="h-4 w-4 text-purple-600" />
          <span className="text-[11px] font-semibold uppercase">Median Waktu Respon</span>
        </div>
        <div className="flex items-baseline space-x-1 mt-1">
          <span className="text-3xl font-black text-slate-900">
            {(metrics.medianResponseTimeMs / 1000).toFixed(1)}s
          </span>
          <span className="text-xs text-slate-500 font-medium">/soal</span>
        </div>
        <span className="text-[11px] text-slate-400 mt-1">Nilai tengah durasi respon</span>
      </div>

      {/* KPI 4: Timeouts */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
        <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
          <AlertTriangle className="h-4 w-4 text-rose-500" />
          <span className="text-[11px] font-semibold uppercase">Modul Timeout</span>
        </div>
        <div className="flex items-baseline space-x-1 mt-1">
          <span
            className={`text-3xl font-black ${
              metrics.timeoutCount > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {metrics.timeoutCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">modul</span>
        </div>
        <span className="text-[11px] text-slate-400 mt-1">
          {metrics.timeoutCount === 0 ? "Semua selesai < 60s" : "Habis waktu 60s"}
        </span>
      </div>

      {/* KPI 5: Stabilitas Konsentrasi */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
        <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
          <BarChart3 className="h-4 w-4 text-emerald-600" />
          <span className="text-[11px] font-semibold uppercase">Indeks Konsistensi</span>
        </div>
        <div className="flex items-baseline space-x-1 mt-1">
          <span className="text-3xl font-black text-blue-700">{stability}</span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
        <span className="text-[11px] text-slate-400 mt-1">
          Stabilitas akurasi antar subtes
        </span>
      </div>
    </div>
  );
}
