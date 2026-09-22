import React, { useState, useMemo } from "react";
import { ModulePerformanceItem } from "@/features/scoring/pacingMetrics";
import { ChevronDown, ChevronUp, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PacingDataTableProps {
  modules: ModulePerformanceItem[];
  selectedModuleNum: number | null;
  onSelectModule: (moduleNum: number) => void;
}

export function PacingDataTable({
  modules,
  selectedModuleNum,
  onSelectModule,
}: PacingDataTableProps) {
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [sortField, setSortField] = useState<keyof ModulePerformanceItem>("moduleNumber");
  const [sortAsc, setSortAsc] = useState(true);

  const sortedModules = useMemo(() => {
    const copy = [...modules];
    copy.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (valA === null || valA === undefined) valA = -999999;
      if (valB === null || valB === undefined) valB = -999999;
      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
    return copy;
  }, [modules, sortField, sortAsc]);

  const handleSort = (field: keyof ModulePerformanceItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Header with expand toggle */}
      <button
        type="button"
        className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between text-left transition-colors"
        onClick={() => setIsTableExpanded(!isTableExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-800">
            Tabel Rincian Telemetri 21 Modul
          </span>
          <span className="text-[11px] text-slate-500">
            ({modules.filter((m) => m.isAttempted).length} dari 21 modul selesai)
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-blue-700 font-semibold">
          <span>{isTableExpanded ? "Tutup Tabel" : "Buka Tabel Lengkap"}</span>
          {isTableExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isTableExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-600 font-semibold">
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-700"
                  onClick={() => handleSort("moduleNumber")}
                >
                  No {sortField === "moduleNumber" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-700"
                  onClick={() => handleSort("title")}
                >
                  Modul {sortField === "title" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th className="py-2.5 px-3">Domain</th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-700"
                  onClick={() => handleSort("total")}
                >
                  Soal
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-700"
                  onClick={() => handleSort("answered")}
                >
                  Jawab
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-700"
                  onClick={() => handleSort("correct")}
                >
                  Benar
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-700"
                  onClick={() => handleSort("accuracy")}
                >
                  Akurasi {sortField === "accuracy" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-700"
                  onClick={() => handleSort("medianResponseTimeMs")}
                >
                  Median Waktu {sortField === "medianResponseTimeMs" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedModules.map((m) => {
                const isSelected = selectedModuleNum === m.moduleNumber;
                return (
                  <tr
                    key={m.moduleNumber}
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50 font-semibold" : ""
                    }`}
                    onClick={() => onSelectModule(m.moduleNumber)}
                  >
                    <td className="py-2 px-3 font-mono text-slate-500">
                      {String(m.moduleNumber).padStart(2, "0")}
                    </td>
                    <td className="py-2 px-3">{m.title}</td>
                    <td className="py-2 px-3 text-slate-500">{m.domainLabel}</td>
                    <td className="py-2 px-3 text-right font-mono">{m.total}</td>
                    <td className="py-2 px-3 text-right font-mono">{m.answered}</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-700 font-semibold">
                      {m.correct}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {m.accuracy !== null ? (
                        <span
                          className={
                            m.accuracy >= 75
                              ? "text-blue-700 font-bold"
                              : m.accuracy >= 50
                              ? "text-amber-600"
                              : "text-rose-600"
                          }
                        >
                          {m.accuracy}%
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {m.medianResponseTimeMs !== null
                        ? `${(m.medianResponseTimeMs / 1000).toFixed(1)}s`
                        : "-"}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {!m.isAttempted ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-400">
                          Belum
                        </span>
                      ) : m.timedOut ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-medium inline-flex items-center">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                          Timeout
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium inline-flex items-center">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                          Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
