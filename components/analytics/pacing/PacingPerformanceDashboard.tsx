"use client";

import React, { useState, useMemo } from "react";
import { Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PacingMetricsSummary,
  generatePacingCsv,
} from "@/features/scoring/pacingMetrics";
import { PacingKpiCards } from "./PacingKpiCards";
import { PacingDualLineChart } from "./PacingDualLineChart";
import { PacingModuleDetailCard } from "./PacingModuleDetailCard";
import { PacingDropRecoveryBanner } from "./PacingDropRecoveryBanner";
import { PacingDataTable } from "./PacingDataTable";

export interface PacingPerformanceDashboardProps {
  pacingSummary: PacingMetricsSummary;
  fatigueIndex?: number; // legacy prop for compatibility
}

export function PacingPerformanceDashboard({
  pacingSummary,
}: PacingPerformanceDashboardProps) {
  const [selectedModuleNum, setSelectedModuleNum] = useState<number | null>(null);

  const {
    modules,
    baselineAccuracy,
    baselineMedianResponseTimeMs,
    largestDrop,
    recovery,
    insights,
  } = pacingSummary;

  // Selected module data for inspector card
  const activeModule = useMemo(() => {
    if (selectedModuleNum !== null) {
      return modules.find((m) => m.moduleNumber === selectedModuleNum) || null;
    }
    if (largestDrop) {
      return (
        modules.find((m) => m.moduleNumber === largestDrop.toModule) ||
        modules[0] ||
        null
      );
    }
    return modules[0] || null;
  }, [selectedModuleNum, modules, largestDrop]);

  // Handle CSV Download
  const handleDownloadCsv = () => {
    const csvContent = generatePacingCsv(modules);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `analisis_pacing_21_modul_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Tren Pacing & Performa Kognitif (21 Modul)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi longitudinal dinamika akurasi, laju pengerjaan, dan stabilitas performa antar subtes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadCsv}
            className="text-xs h-8 px-2.5 text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <PacingKpiCards summary={pacingSummary} />

      {/* 3. Coordinated Dual-Line Charts */}
      <PacingDualLineChart
        modules={modules}
        baselineAccuracy={baselineAccuracy}
        baselineMedianResponseTimeMs={baselineMedianResponseTimeMs}
        largestDrop={largestDrop}
        selectedModuleNum={selectedModuleNum}
        onSelectModule={setSelectedModuleNum}
      />

      {/* 4. Active Module Detail Card */}
      <PacingModuleDetailCard
        activeModule={activeModule}
        baselineMedianResponseTimeMs={baselineMedianResponseTimeMs}
      />

      {/* 5. Drop & Recovery Alerts + Insights */}
      <PacingDropRecoveryBanner
        largestDrop={largestDrop}
        recovery={recovery}
        insights={insights}
      />

      {/* 6. Sortable Detailed Data Table */}
      <PacingDataTable
        modules={modules}
        selectedModuleNum={selectedModuleNum}
        onSelectModule={setSelectedModuleNum}
      />
    </div>
  );
}
