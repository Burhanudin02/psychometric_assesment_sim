"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ModulePerformanceItem,
  PacingMetricsSummary,
  generatePacingCsv,
} from "@/features/scoring/pacingMetrics";

interface PacingPerformanceDashboardProps {
  pacingSummary: PacingMetricsSummary;
  fatigueIndex?: number; // legacy prop for compatibility
}

export function PacingPerformanceDashboard({
  pacingSummary,
  fatigueIndex,
}: PacingPerformanceDashboardProps) {
  const [selectedModuleNum, setSelectedModuleNum] = useState<number | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);
  const [sortField, setSortField] = useState<keyof ModulePerformanceItem>("moduleNumber");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const {
    modules,
    baselineAccuracy,
    baselineMedianResponseTimeMs,
    earlyPhase,
    middlePhase,
    latePhase,
    deltaAccuracyPp,
    deltaResponseTimeSec,
    deltaTimeoutCount,
    largestDrop,
    recovery,
    attemptedModuleCount,
    overallAccuracy,
    overallMedianResponseTimeMs,
    totalTimeouts,
    stabilityScore,
    insights,
  } = pacingSummary;

  // Selected module data for tooltip/card
  const activeModule = useMemo(() => {
    if (selectedModuleNum !== null) {
      return modules.find((m) => m.moduleNumber === selectedModuleNum) || null;
    }
    // Default to largest drop module or first module if none selected
    if (largestDrop) {
      return modules.find((m) => m.moduleNumber === largestDrop.toModule) || modules[0] || null;
    }
    return modules[0] || null;
  }, [selectedModuleNum, modules, largestDrop]);

  // Chart dimensions and scaling
  const chartWidth = 840;
  const paddingLeft = 48;
  const paddingRight = 32;
  const usableWidth = chartWidth - paddingLeft - paddingRight;

  const accChartHeight = 160;
  const accPaddingTop = 20;
  const accPaddingBottom = 28;
  const usableAccHeight = accChartHeight - accPaddingTop - accPaddingBottom;

  const timeChartHeight = 150;
  const timePaddingTop = 20;
  const timePaddingBottom = 28;
  const usableTimeHeight = timeChartHeight - timePaddingTop - timePaddingBottom;

  // X coordinate calculation for module 1..21
  const getX = (moduleNum: number) => {
    return paddingLeft + ((moduleNum - 1) / 20) * usableWidth;
  };

  // Y coordinate for Accuracy (0% to 100%)
  const getYAcc = (accuracyPct: number) => {
    const clamped = Math.max(0, Math.min(100, accuracyPct));
    return accPaddingTop + (1 - clamped / 100) * usableAccHeight;
  };

  // Calculate Max Response Time for Y scale (minimum 12s, cap at 25s or round up to nearest 5s)
  const maxResponseTimeSec = useMemo(() => {
    let maxSec = 10;
    for (const m of modules) {
      if (m.medianResponseTimeMs) {
        const sec = m.medianResponseTimeMs / 1000;
        if (sec > maxSec) maxSec = sec;
      }
    }
    return Math.min(25, Math.max(12, Math.ceil(maxSec / 2) * 2));
  }, [modules]);

  // Y coordinate for Response Time (0s to maxResponseTimeSec)
  const getYTime = (timeSec: number) => {
    const clamped = Math.max(0, Math.min(maxResponseTimeSec, timeSec));
    return timePaddingTop + (1 - clamped / maxResponseTimeSec) * usableTimeHeight;
  };

  // Build SVG continuous line paths, skipping unattempted modules
  const accPathData = useMemo(() => {
    const segments: string[] = [];
    let currentSegment: { x: number; y: number }[] = [];

    for (const m of modules) {
      if (m.isAttempted && m.accuracy !== null) {
        currentSegment.push({ x: getX(m.moduleNumber), y: getYAcc(m.accuracy) });
      } else {
        if (currentSegment.length > 0) {
          segments.push(
            currentSegment
              .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
              .join(" ")
          );
          currentSegment = [];
        }
      }
    }
    if (currentSegment.length > 0) {
      segments.push(
        currentSegment
          .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
          .join(" ")
      );
    }
    return segments;
  }, [modules, usableWidth]);

  const timePathData = useMemo(() => {
    const segments: string[] = [];
    let currentSegment: { x: number; y: number }[] = [];

    for (const m of modules) {
      if (m.isAttempted && m.medianResponseTimeMs !== null) {
        const sec = m.medianResponseTimeMs / 1000;
        currentSegment.push({ x: getX(m.moduleNumber), y: getYTime(sec) });
      } else {
        if (currentSegment.length > 0) {
          segments.push(
            currentSegment
              .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
              .join(" ")
          );
          currentSegment = [];
        }
      }
    }
    if (currentSegment.length > 0) {
      segments.push(
        currentSegment
          .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
          .join(" ")
      );
    }
    return segments;
  }, [modules, usableWidth, maxResponseTimeSec]);

  // Phase background bands boundaries
  const stepX = usableWidth / 20;
  const phase1X = paddingLeft - stepX / 2;
  const phase1W = getX(7) + stepX / 2 - phase1X;
  const phase2X = getX(8) - stepX / 2;
  const phase2W = getX(14) + stepX / 2 - phase2X;
  const phase3X = getX(15) - stepX / 2;
  const phase3W = getX(21) + stepX / 2 - phase3X;

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

  // Sortable table modules
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

      {/* 3. Coordinated Dual-Line Charts */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-slate-800">Panduan Grafik:</span>
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
              <span className="text-slate-600">Akurasi (%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600 inline-block" />
              <span className="text-slate-600">Waktu Respon (s)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-rose-500 font-bold text-xs">▲</span>
              <span className="text-slate-600">Timeout</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="inline-block w-4 border-b border-dashed border-slate-400" />
              <span className="text-slate-500">Baseline (M01–M05)</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            *Klik atau arahkan kursor ke titik modul untuk melihat detail
          </span>
        </div>

        {/* Outer scrollable container for responsiveness on mobile screens */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[760px] select-none">
            {/* CHART 1: ACCURACY TREND */}
            <div className="relative">
              <div className="absolute left-2 top-1 text-[11px] font-bold text-slate-700 bg-white/90 px-1 rounded z-10">
                Akurasi Modul (%)
              </div>

              <svg
                viewBox={`0 0 ${chartWidth} ${accChartHeight}`}
                className="w-full h-[160px] overflow-visible"
              >
                {/* Phase background bands */}
                <rect
                  x={phase1X}
                  y={accPaddingTop}
                  width={phase1W}
                  height={usableAccHeight}
                  fill="#F0F9FF"
                  opacity="0.6"
                />
                <rect
                  x={phase2X}
                  y={accPaddingTop}
                  width={phase2W}
                  height={usableAccHeight}
                  fill="#F8FAFC"
                  opacity="0.8"
                />
                <rect
                  x={phase3X}
                  y={accPaddingTop}
                  width={phase3W}
                  height={usableAccHeight}
                  fill="#EEF2FF"
                  opacity="0.6"
                />

                {/* Horizontal Grid lines (0%, 25%, 50%, 75%, 100%) */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = getYAcc(val);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray={val === 0 || val === 100 ? "0" : "3 3"}
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#94A3B8"
                        fontFamily="monospace"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Baseline Reference Line */}
                {baselineAccuracy !== null && (
                  <g>
                    <line
                      x1={paddingLeft}
                      y1={getYAcc(baselineAccuracy)}
                      x2={chartWidth - paddingRight}
                      y2={getYAcc(baselineAccuracy)}
                      stroke="#64748B"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                    <text
                      x={chartWidth - paddingRight - 4}
                      y={getYAcc(baselineAccuracy) - 4}
                      textAnchor="end"
                      fontSize="9"
                      fill="#64748B"
                      fontWeight="bold"
                    >
                      Baseline: {baselineAccuracy}%
                    </text>
                  </g>
                )}

                {/* Vertical Cursor Crosshair Line on hover */}
                {activeModule && (
                  <line
                    x1={getX(activeModule.moduleNumber)}
                    y1={accPaddingTop}
                    x2={getX(activeModule.moduleNumber)}
                    y2={accChartHeight - accPaddingBottom}
                    stroke="#94A3B8"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                  />
                )}

                {/* Accuracy Line Segments */}
                {accPathData.map((d, idx) => (
                  <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Module Points */}
                {modules.map((m) => {
                  const cx = getX(m.moduleNumber);
                  const isAttempted = m.isAttempted && m.accuracy !== null;
                  const cy = isAttempted ? getYAcc(m.accuracy!) : getYAcc(0);
                  const isSelected = activeModule?.moduleNumber === m.moduleNumber;

                  if (!isAttempted) {
                    return (
                      <g key={m.moduleNumber} className="cursor-pointer" onClick={() => setSelectedModuleNum(m.moduleNumber)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="#F1F5F9"
                          stroke="#CBD5E1"
                          strokeWidth="1.5"
                        />
                        <text
                          x={cx}
                          y={cy + 3}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#94A3B8"
                          fontWeight="bold"
                        >
                          ✕
                        </text>
                      </g>
                    );
                  }

                  return (
                    <g
                      key={m.moduleNumber}
                      className="cursor-pointer group"
                      onClick={() => setSelectedModuleNum(m.moduleNumber)}
                    >
                      {/* Interactive hover hit-area */}
                      <circle cx={cx} cy={cy} r="14" fill="transparent" />

                      {/* Selection indicator ring */}
                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="9"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2"
                          opacity="0.5"
                          className="animate-pulse"
                        />
                      )}

                      {/* Point Circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 5.5 : 4}
                        fill={isSelected ? "#1D4ED8" : "#2563EB"}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />

                      {/* Timeout Triangle Indicator (▲) */}
                      {m.timedOut && (
                        <g transform={`translate(${cx - 5}, ${cy - 16})`}>
                          <polygon
                            points="5,0 10,9 0,9"
                            fill="#EF4444"
                            stroke="#FFFFFF"
                            strokeWidth="1"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* CHART 2: MEDIAN RESPONSE TIME TREND */}
            <div className="relative border-t border-slate-100 pt-2">
              <div className="absolute left-2 top-3 text-[11px] font-bold text-slate-700 bg-white/90 px-1 rounded z-10">
                Median Waktu Respon (detik/soal)
              </div>

              <svg
                viewBox={`0 0 ${chartWidth} ${timeChartHeight}`}
                className="w-full h-[150px] overflow-visible"
              >
                {/* Phase background bands */}
                <rect
                  x={phase1X}
                  y={timePaddingTop}
                  width={phase1W}
                  height={usableTimeHeight}
                  fill="#F0F9FF"
                  opacity="0.6"
                />
                <rect
                  x={phase2X}
                  y={timePaddingTop}
                  width={phase2W}
                  height={usableTimeHeight}
                  fill="#F8FAFC"
                  opacity="0.8"
                />
                <rect
                  x={phase3X}
                  y={timePaddingTop}
                  width={phase3W}
                  height={usableTimeHeight}
                  fill="#EEF2FF"
                  opacity="0.6"
                />

                {/* Horizontal Grid lines */}
                {[0, Math.round(maxResponseTimeSec / 2), maxResponseTimeSec].map((val) => {
                  const y = getYTime(val);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray={val === 0 ? "0" : "3 3"}
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#94A3B8"
                        fontFamily="monospace"
                      >
                        {val}s
                      </text>
                    </g>
                  );
                })}

                {/* Baseline Reference Line for Speed */}
                {baselineMedianResponseTimeMs !== null && (
                  <g>
                    <line
                      x1={paddingLeft}
                      y1={getYTime(baselineMedianResponseTimeMs / 1000)}
                      x2={chartWidth - paddingRight}
                      y2={getYTime(baselineMedianResponseTimeMs / 1000)}
                      stroke="#64748B"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                    <text
                      x={chartWidth - paddingRight - 4}
                      y={getYTime(baselineMedianResponseTimeMs / 1000) - 4}
                      textAnchor="end"
                      fontSize="9"
                      fill="#64748B"
                      fontWeight="bold"
                    >
                      Baseline: {(baselineMedianResponseTimeMs / 1000).toFixed(1)}s
                    </text>
                  </g>
                )}

                {/* Vertical Cursor Crosshair Line on hover */}
                {activeModule && (
                  <line
                    x1={getX(activeModule.moduleNumber)}
                    y1={timePaddingTop}
                    x2={getX(activeModule.moduleNumber)}
                    y2={timeChartHeight - timePaddingBottom}
                    stroke="#94A3B8"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                  />
                )}

                {/* Speed Line Segments */}
                {timePathData.map((d, idx) => (
                  <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Module Points for Speed */}
                {modules.map((m) => {
                  const cx = getX(m.moduleNumber);
                  const isAttempted = m.isAttempted && m.medianResponseTimeMs !== null;
                  const cy = isAttempted ? getYTime(m.medianResponseTimeMs! / 1000) : getYTime(0);
                  const isSelected = activeModule?.moduleNumber === m.moduleNumber;

                  if (!isAttempted) {
                    return (
                      <g key={m.moduleNumber} className="cursor-pointer" onClick={() => setSelectedModuleNum(m.moduleNumber)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="#F1F5F9"
                          stroke="#CBD5E1"
                          strokeWidth="1.5"
                        />
                        <text
                          x={cx}
                          y={cy + 3}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#94A3B8"
                          fontWeight="bold"
                        >
                          ✕
                        </text>
                      </g>
                    );
                  }

                  return (
                    <g
                      key={m.moduleNumber}
                      className="cursor-pointer"
                      onClick={() => setSelectedModuleNum(m.moduleNumber)}
                    >
                      <circle cx={cx} cy={cy} r="14" fill="transparent" />

                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="9"
                          fill="none"
                          stroke="#D97706"
                          strokeWidth="2"
                          opacity="0.5"
                          className="animate-pulse"
                        />
                      )}

                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 5.5 : 4}
                        fill={isSelected ? "#B45309" : "#D97706"}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />

                      {m.timedOut && (
                        <g transform={`translate(${cx - 5}, ${cy - 16})`}>
                          <polygon
                            points="5,0 10,9 0,9"
                            fill="#EF4444"
                            stroke="#FFFFFF"
                            strokeWidth="1"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Shared X-Axis Numbers (01..21) */}
                {modules.map((m) => {
                  const cx = getX(m.moduleNumber);
                  const isSelected = activeModule?.moduleNumber === m.moduleNumber;
                  return (
                    <g
                      key={m.moduleNumber}
                      className="cursor-pointer"
                      onClick={() => setSelectedModuleNum(m.moduleNumber)}
                    >
                      <text
                        x={cx}
                        y={timeChartHeight - 8}
                        textAnchor="middle"
                        fontSize={isSelected ? "11" : "10"}
                        fontWeight={isSelected ? "bold" : "normal"}
                        fill={isSelected ? "#1E293B" : "#64748B"}
                        fontFamily="monospace"
                      >
                        {String(m.moduleNumber).padStart(2, "0")}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Phase Zone Labels below charts */}
            <div className="flex justify-between px-12 pt-2 text-[11px] font-semibold text-slate-500 border-t border-slate-100">
              <span className="text-blue-700">Fase Awal: Modul 01–07</span>
              <span className="text-slate-600">Fase Tengah: Modul 08–14</span>
              <span className="text-indigo-700">Fase Akhir: Modul 15–21</span>
            </div>
          </div>
        </div>

        {/* Active Module Details Callout Box */}
        {activeModule && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-blue-600 text-white font-mono">
                    Modul {String(activeModule.moduleNumber).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{activeModule.title}</span>
                  {activeModule.timedOut && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-rose-100 text-rose-700 border border-rose-200 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Timeout (60s habis)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Domain: <span className="font-semibold text-slate-700">{activeModule.domainLabel}</span>
                  {activeModule.subtopic && ` • Subtopik: ${activeModule.subtopic}`}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div>
                  <span className="text-slate-500">Akurasi: </span>
                  {activeModule.accuracy !== null ? (
                    <span className="font-bold text-blue-700 text-sm">
                      {activeModule.accuracy}% ({activeModule.correct}/{activeModule.answered} Benar)
                    </span>
                  ) : (
                    <span className="font-bold text-slate-400">Belum Dikerjakan</span>
                  )}
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500">Waktu Respon: </span>
                  {activeModule.medianResponseTimeMs !== null ? (
                    <span className="font-bold text-amber-700 text-sm">
                      {(activeModule.medianResponseTimeMs / 1000).toFixed(1)}s
                      <span className="text-[10px] text-slate-500 font-normal"> /soal</span>
                    </span>
                  ) : (
                    <span className="font-bold text-slate-400">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Early vs. Late Comparison Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Phase Comparison Cards */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <TrendingUp className="h-4 w-4 mr-1.5 text-blue-600" />
              Perbandingan Fase Awal vs Akhir
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mengukur adaptasi kognitif antara 7 modul pertama dan 7 modul terakhir.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Early Phase */}
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
              <span className="text-[11px] font-bold text-blue-900 block">Fase Awal (M01–M07)</span>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Akurasi Rata-rata:</span>
                  <span className="font-bold text-slate-900">
                    {earlyPhase.accuracy !== null ? `${earlyPhase.accuracy}%` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Median Waktu:</span>
                  <span className="font-bold text-slate-900">
                    {earlyPhase.medianResponseTimeMs !== null
                      ? `${(earlyPhase.medianResponseTimeMs / 1000).toFixed(1)}s`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kehabisan Waktu:</span>
                  <span className="font-bold text-slate-900">{earlyPhase.timeoutCount} modul</span>
                </div>
              </div>
            </div>

            {/* Late Phase */}
            <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
              <span className="text-[11px] font-bold text-indigo-900 block">Fase Akhir (M15–M21)</span>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Akurasi Rata-rata:</span>
                  <span className="font-bold text-slate-900">
                    {latePhase.accuracy !== null ? `${latePhase.accuracy}%` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Median Waktu:</span>
                  <span className="font-bold text-slate-900">
                    {latePhase.medianResponseTimeMs !== null
                      ? `${(latePhase.medianResponseTimeMs / 1000).toFixed(1)}s`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kehabisan Waktu:</span>
                  <span className="font-bold text-slate-900">{latePhase.timeoutCount} modul</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Badges */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500 text-[11px]">Selisih Akurasi: </span>
              {deltaAccuracyPp !== null ? (
                <span
                  className={`font-bold ${
                    deltaAccuracyPp >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {deltaAccuracyPp >= 0 ? `+${deltaAccuracyPp}` : deltaAccuracyPp} pp
                </span>
              ) : (
                <span className="font-bold text-slate-400">N/A</span>
              )}
            </div>

            <div className="h-3 w-px bg-slate-300 hidden sm:block" />

            <div>
              <span className="text-slate-500 text-[11px]">Selisih Laju Waktu: </span>
              {deltaResponseTimeSec !== null ? (
                <span
                  className={`font-bold ${
                    deltaResponseTimeSec <= 0 ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {deltaResponseTimeSec >= 0 ? `+${deltaResponseTimeSec}` : deltaResponseTimeSec} s
                </span>
              ) : (
                <span className="font-bold text-slate-400">N/A</span>
              )}
            </div>

            <div className="h-3 w-px bg-slate-300 hidden sm:block" />

            <div>
              <span className="text-slate-500 text-[11px]">Selisih Timeout: </span>
              <span className="font-bold text-slate-800">
                {deltaTimeoutCount >= 0 ? `+${deltaTimeoutCount}` : deltaTimeoutCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Drop & Recovery Callouts & Insights */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5 text-indigo-600" />
              Temuan Pola Performa
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Deteksi transisi kritis, penurunan tajam, dan pemulihan performa.
            </p>
          </div>

          <div className="space-y-2.5 flex-1">
            {/* Largest Drop Notification */}
            {largestDrop ? (
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-amber-900 mb-1">
                  <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
                  <span>Penurunan Terbesar: Modul {largestDrop.fromModule} → {largestDrop.toModule}</span>
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  {largestDrop.description}. Transisi dari <em>{largestDrop.fromTitle}</em> ke <em>{largestDrop.toTitle}</em>.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 text-xs flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-800 text-[11px]">
                  Tidak ditemukan penurunan performa tajam (>12 poin) antar modul berurutan. Ritme Anda stabil.
                </span>
              </div>
            )}

            {/* Late Recovery Notification */}
            {recovery?.hasRecovered && (
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-blue-900 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  <span>Pemulihan Performa Terdeteksi (Recovery)</span>
                </div>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  {recovery.description}
                </p>
              </div>
            )}

            {/* General Insights */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Catatan Analisis Otomatis:
              </span>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                {insights.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Module Performance Heatmap Matrix */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Matriks Heatmap Performa 21 Modul
            </h4>
            <p className="text-[11px] text-slate-500">
              Gambaran cepat akurasi dan kecepatan untuk setiap subtes.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-500">
            <span className="inline-block w-3 h-3 rounded-xs bg-emerald-500" /> ≥80%
            <span className="inline-block w-3 h-3 rounded-xs bg-sky-500 ml-2" /> 65–79%
            <span className="inline-block w-3 h-3 rounded-xs bg-amber-500 ml-2" /> 50–64%
            <span className="inline-block w-3 h-3 rounded-xs bg-rose-500 ml-2" /> &lt;50%
            <span className="inline-block w-3 h-3 rounded-xs bg-slate-200 ml-2" /> Belum
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-21 gap-1.5 pt-1">
          {modules.map((m) => {
            const isSelected = activeModule?.moduleNumber === m.moduleNumber;
            let bgColor = "bg-slate-100 text-slate-400 border-slate-200";
            if (m.isAttempted && m.accuracy !== null) {
              if (m.accuracy >= 80) bgColor = "bg-emerald-50 text-emerald-900 border-emerald-300";
              else if (m.accuracy >= 65) bgColor = "bg-sky-50 text-sky-900 border-sky-300";
              else if (m.accuracy >= 50) bgColor = "bg-amber-50 text-amber-900 border-amber-300";
              else bgColor = "bg-rose-50 text-rose-900 border-rose-300";
            }

            return (
              <button
                key={m.moduleNumber}
                type="button"
                onClick={() => setSelectedModuleNum(m.moduleNumber)}
                className={`flex flex-col items-center justify-center p-1.5 rounded border text-center transition-all ${bgColor} ${
                  isSelected ? "ring-2 ring-blue-600 font-bold scale-105 z-10" : "hover:opacity-80"
                }`}
                title={`${m.title} - Akurasi: ${m.accuracy !== null ? `${m.accuracy}%` : "N/A"}`}
              >
                <span className="text-[10px] font-mono leading-none">
                  {String(m.moduleNumber).padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold mt-1 leading-none">
                  {m.accuracy !== null ? `${Math.round(m.accuracy)}%` : "-"}
                </span>
                {m.timedOut && (
                  <span className="text-[8px] text-rose-600 font-bold mt-0.5 leading-none">▲</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Expandable Raw Data Table */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setIsTableExpanded(!isTableExpanded)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Lihat Data Mentah Lengkap Modul (21 Modul)
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              Tabel Terstruktur
            </span>
          </div>
          {isTableExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>

        {isTableExpanded && (
          <div className="p-4 border-t border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th
                    className="p-2 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("moduleNumber")}
                  >
                    No {sortField === "moduleNumber" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    className="p-2 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("title")}
                  >
                    Judul Modul {sortField === "title" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    className="p-2 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("domainLabel")}
                  >
                    Domain {sortField === "domainLabel" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th className="p-2 text-center">Status</th>
                  <th
                    className="p-2 text-center cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("answered")}
                  >
                    Soal Dijawab {sortField === "answered" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("accuracy")}
                  >
                    Akurasi {sortField === "accuracy" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("medianResponseTimeMs")}
                  >
                    Median Waktu {sortField === "medianResponseTimeMs" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("timedOut")}
                  >
                    Timeout {sortField === "timedOut" && (sortAsc ? "▲" : "▼")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedModules.map((m) => (
                  <tr
                    key={m.moduleNumber}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      activeModule?.moduleNumber === m.moduleNumber ? "bg-blue-50/70 font-semibold" : ""
                    }`}
                    onClick={() => setSelectedModuleNum(m.moduleNumber)}
                  >
                    <td className="p-2 font-mono">{String(m.moduleNumber).padStart(2, "0")}</td>
                    <td className="p-2 text-slate-900">{m.title}</td>
                    <td className="p-2 text-slate-500">{m.domainLabel}</td>
                    <td className="p-2 text-center">
                      {m.isAttempted ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          Selesai
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center font-mono">
                      {m.answered} / {m.total}
                    </td>
                    <td className="p-2 text-center font-mono">
                      {m.accuracy !== null ? `${m.accuracy}%` : "N/A"}
                    </td>
                    <td className="p-2 text-center font-mono">
                      {m.medianResponseTimeMs !== null
                        ? `${(m.medianResponseTimeMs / 1000).toFixed(1)}s`
                        : "N/A"}
                    </td>
                    <td className="p-2 text-center">
                      {m.timedOut ? (
                        <span className="text-xs font-bold text-rose-600 flex items-center justify-center">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Ya
                        </span>
                      ) : (
                        <span className="text-slate-400">Tidak</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Non-Clinical Performance Disclaimer */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-600 flex items-start space-x-2.5">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <span className="font-semibold text-slate-800">Catatan Interpretasi Analisis: </span>
          Fluktuasi akurasi dan kecepatan respon sepanjang 21 modul dipengaruhi oleh keragaman domain uji
          (aritmatika, spasial, verbal, abstrak), variasi tingkat kesulitan butir soal, serta strategi
          manajemen waktu peserta. Laporan ini merupakan instrumen diagnostik persiapan pelatihan dan bukan
          evaluasi klinis kapasitas psikologis.
        </div>
      </div>
    </div>
  );
}

