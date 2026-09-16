"use client";

import React from "react";

interface ModuleBreakdownItem {
  moduleNumber: number;
  total: number;
  correct: number;
  accuracy: number;
  medianResponseTimeMs: number;
  timedOut: boolean;
}

interface ModuleFatigueTrendProps {
  moduleBreakdown: ModuleBreakdownItem[];
  fatigueIndex: number;
}

export function ModuleFatigueTrend({ moduleBreakdown, fatigueIndex }: ModuleFatigueTrendProps) {
  const chartHeight = 160;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Tren Pacing & Stamina Kognitif (21 Modul)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Fluktuasi akurasi (%) dan deteksi penurunan daya tahan mental antar subtes.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              fatigueIndex > 15
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "bg-emerald-100 text-emerald-900 border border-emerald-300"
            }`}
          >
            Indeks Penurunan Stamina: {fatigueIndex > 0 ? `-${fatigueIndex}%` : `${Math.abs(fatigueIndex)}%`}
          </span>
        </div>
      </div>

      {/* Bar Chart across 21 modules */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[640px] flex items-end justify-between space-x-1.5 h-[160px] pt-4 px-2 border-b border-slate-200">
          {moduleBreakdown.map((m) => {
            const barHeightPct = Math.max(8, m.accuracy);
            const isLate = m.moduleNumber >= 15;
            const isEarly = m.moduleNumber <= 7;

            return (
              <div key={m.moduleNumber} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none z-10 whitespace-nowrap">
                  <span>Modul {m.moduleNumber}: {m.accuracy}%</span>
                  <span>Waktu: {(m.medianResponseTimeMs / 1000).toFixed(1)}s {m.timedOut ? "(Timeout)" : ""}</span>
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${barHeightPct}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    m.timedOut
                      ? "bg-red-500 hover:bg-red-600"
                      : isLate
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : isEarly
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="min-w-[640px] flex justify-between space-x-1.5 px-2 pt-2 text-[10px] text-slate-400 font-mono">
          {moduleBreakdown.map((m) => (
            <div key={m.moduleNumber} className="flex-1 text-center truncate">
              {String(m.moduleNumber).padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Phase annotations */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-xs bg-blue-600 inline-block" />
            <span>Awal (M01-M07)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-xs bg-sky-600 inline-block" />
            <span>Tengah (M08-M14)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-xs bg-indigo-600 inline-block" />
            <span>Akhir (M15-M21)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-xs bg-red-500 inline-block" />
            <span>Timeout</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          *Arahkan kursor ke tiap batang untuk melihat rincian modul
        </p>
      </div>
    </div>
  );
}
