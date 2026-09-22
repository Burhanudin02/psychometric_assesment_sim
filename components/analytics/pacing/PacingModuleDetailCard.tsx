import React from "react";
import { ModulePerformanceItem } from "@/features/scoring/pacingMetrics";
import { Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface PacingModuleDetailCardProps {
  activeModule: ModulePerformanceItem | null;
  baselineMedianResponseTimeMs: number | null;
}

export function PacingModuleDetailCard({
  activeModule,
  baselineMedianResponseTimeMs,
}: PacingModuleDetailCardProps) {
  if (!activeModule) return null;

  const m = activeModule;
  const paceSec = m.medianResponseTimeMs ? (m.medianResponseTimeMs / 1000).toFixed(1) : "-";

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded">
            Modul {String(m.moduleNumber).padStart(2, "0")}
          </span>
          <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
            {m.domainLabel}
          </span>
          {m.subtopic && (
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px]">
              {m.subtopic}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Metric 1: Status */}
        <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-medium uppercase">Status Pengerjaan</span>
          <div className="flex items-center space-x-1.5 mt-1">
            {m.isAttempted ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                Dikerjakan
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-400 flex items-center">
                <XCircle className="h-3.5 w-3.5 mr-1 text-slate-400" />
                Dilewati / Belum
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Akurasi */}
        <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-medium uppercase">Akurasi Modul</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span
              className={`text-lg font-extrabold ${
                m.accuracy === null
                  ? "text-slate-400"
                  : m.accuracy >= 75
                  ? "text-blue-700"
                  : m.accuracy >= 50
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {m.accuracy !== null ? `${m.accuracy}%` : "N/A"}
            </span>
            {m.accuracy !== null && (
              <span className="text-[10px] text-slate-500">
                ({m.correct}/{m.answered} benar)
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Kecepatan */}
        <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-medium uppercase">Median Laju Respon</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-lg font-extrabold text-slate-900">{paceSec}s</span>
            <span className="text-[10px] text-slate-500">/soal</span>
          </div>
          {baselineMedianResponseTimeMs && m.medianResponseTimeMs ? (
            <span className="text-[9px] text-slate-400 mt-0.5">
              {m.medianResponseTimeMs > baselineMedianResponseTimeMs ? "Melambat vs baseline" : "Lebih cepat vs baseline"}
            </span>
          ) : null}
        </div>

        {/* Metric 4: Timeout */}
        <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-medium uppercase">Batas Waktu (60s)</span>
          <div className="flex items-center space-x-1 mt-1">
            {m.timedOut ? (
              <span className="text-xs font-bold text-rose-600 flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1 text-rose-500" />
                Habis Waktu (Timeout)
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                Tepat Waktu
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
