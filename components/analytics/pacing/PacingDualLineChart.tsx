import React, { useMemo } from "react";
import { ModulePerformanceItem, PerformanceDropInfo } from "@/features/scoring/pacingMetrics";
import {
  CHART_DIMENSIONS,
  getX,
  getYAcc,
  getYTime,
  calculateMaxResponseTimeSec,
  buildAccuracyPathSegments,
  buildResponseTimePathSegments,
  calculatePhaseBands,
} from "./PacingChartGeometry";

interface PacingDualLineChartProps {
  modules: ModulePerformanceItem[];
  baselineAccuracy: number | null;
  baselineMedianResponseTimeMs: number | null;
  largestDrop: PerformanceDropInfo | null;
  selectedModuleNum: number | null;
  onSelectModule: (moduleNum: number) => void;
}

export function PacingDualLineChart({
  modules,
  baselineAccuracy,
  baselineMedianResponseTimeMs,
  largestDrop,
  selectedModuleNum,
  onSelectModule,
}: PacingDualLineChartProps) {
  const {
    chartWidth,
    paddingLeft,
    paddingRight,
    accChartHeight,
    accPaddingTop,
    accPaddingBottom,
    timeChartHeight,
    timePaddingTop,
    timePaddingBottom,
  } = CHART_DIMENSIONS;

  const usableAccHeight = accChartHeight - accPaddingTop - accPaddingBottom;
  const usableTimeHeight = timeChartHeight - timePaddingTop - timePaddingBottom;

  const maxResponseTimeSec = useMemo(
    () => calculateMaxResponseTimeSec(modules),
    [modules]
  );

  const accPathData = useMemo(() => buildAccuracyPathSegments(modules), [modules]);
  const timePathData = useMemo(
    () => buildResponseTimePathSegments(modules, maxResponseTimeSec),
    [modules, maxResponseTimeSec]
  );

  const { phase1X, phase1W, phase2X, phase2W, phase3X, phase3W } = useMemo(
    () => calculatePhaseBands(),
    []
  );

  // Time grid steps
  const timeGridSteps = useMemo(() => {
    const steps = [0];
    const stepSize = maxResponseTimeSec <= 15 ? 3 : 5;
    for (let s = stepSize; s <= maxResponseTimeSec; s += stepSize) {
      steps.push(s);
    }
    return steps;
  }, [maxResponseTimeSec]);

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
      {/* Legend Header */}
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
          *Klik titik modul untuk melihat rincian
        </span>
      </div>

      {/* Scrollable Container */}
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
                    fontWeight="600"
                  >
                    Baseline: {baselineAccuracy}%
                  </text>
                </g>
              )}

              {/* Drop Callout Line */}
              {largestDrop && (
                <g>
                  <line
                    x1={getX(largestDrop.fromModule)}
                    y1={getYAcc(
                      modules.find((m) => m.moduleNumber === largestDrop.fromModule)?.accuracy ?? 50
                    )}
                    x2={getX(largestDrop.toModule)}
                    y2={getYAcc(
                      modules.find((m) => m.moduleNumber === largestDrop.toModule)?.accuracy ?? 50
                    )}
                    stroke="#E11D48"
                    strokeWidth="2.5"
                    strokeDasharray="2 2"
                  />
                </g>
              )}

              {/* Continuous Line Segments */}
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

              {/* Accuracy Data Points */}
              {modules.map((m) => {
                const cx = getX(m.moduleNumber);
                const isSelected = selectedModuleNum === m.moduleNumber;

                if (!m.isAttempted || m.accuracy === null) {
                  return (
                    <g key={m.moduleNumber}>
                      <circle
                        cx={cx}
                        cy={accChartHeight - accPaddingBottom}
                        r="3"
                        fill="#CBD5E1"
                        opacity="0.5"
                      />
                    </g>
                  );
                }

                const cy = getYAcc(m.accuracy);
                return (
                  <g
                    key={m.moduleNumber}
                    className="cursor-pointer transition-all duration-150"
                    onClick={() => onSelectModule(m.moduleNumber)}
                  >
                    {/* Hover hotspot */}
                    <circle cx={cx} cy={cy} r="12" fill="transparent" />

                    {/* Selected Halo */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="9"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    )}

                    {/* Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? "5" : "4"}
                      fill={m.accuracy >= 75 ? "#2563EB" : m.accuracy >= 50 ? "#F59E0B" : "#EF4444"}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />

                    {/* Timeout Badge */}
                    {m.timedOut && (
                      <path
                        d={`M ${cx} ${cy - 12} L ${cx - 4} ${cy - 5} L ${cx + 4} ${cy - 5} Z`}
                        fill="#F43F5E"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* CHART 2: RESPONSE TIME TREND */}
          <div className="relative mt-2">
            <div className="absolute left-2 top-1 text-[11px] font-bold text-slate-700 bg-white/90 px-1 rounded z-10">
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
              {timeGridSteps.map((val) => {
                const y = getYTime(val, maxResponseTimeSec);
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

              {/* Baseline Reference Line */}
              {baselineMedianResponseTimeMs !== null && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={getYTime(baselineMedianResponseTimeMs / 1000, maxResponseTimeSec)}
                    x2={chartWidth - paddingRight}
                    y2={getYTime(baselineMedianResponseTimeMs / 1000, maxResponseTimeSec)}
                    stroke="#D97706"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                  <text
                    x={chartWidth - paddingRight - 4}
                    y={getYTime(baselineMedianResponseTimeMs / 1000, maxResponseTimeSec) - 4}
                    textAnchor="end"
                    fontSize="9"
                    fill="#B45309"
                    fontWeight="600"
                  >
                    Baseline: {(baselineMedianResponseTimeMs / 1000).toFixed(1)}s
                  </text>
                </g>
              )}

              {/* Continuous Line Segments */}
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

              {/* Time Data Points */}
              {modules.map((m) => {
                const cx = getX(m.moduleNumber);
                const isSelected = selectedModuleNum === m.moduleNumber;

                if (!m.isAttempted || m.medianResponseTimeMs === null) {
                  return null;
                }

                const sec = m.medianResponseTimeMs / 1000;
                const cy = getYTime(sec, maxResponseTimeSec);

                return (
                  <g
                    key={m.moduleNumber}
                    className="cursor-pointer"
                    onClick={() => onSelectModule(m.moduleNumber)}
                  >
                    <circle cx={cx} cy={cy} r="12" fill="transparent" />

                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="9"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? "5" : "4"}
                      fill="#D97706"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}

              {/* X Axis: Module Numbers (M01..M21) */}
              {modules.map((m) => {
                const cx = getX(m.moduleNumber);
                const isSelected = selectedModuleNum === m.moduleNumber;
                return (
                  <g
                    key={m.moduleNumber}
                    className="cursor-pointer"
                    onClick={() => onSelectModule(m.moduleNumber)}
                  >
                    <text
                      x={cx}
                      y={timeChartHeight - 10}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight={isSelected ? "700" : "500"}
                      fill={isSelected ? "#1D4ED8" : m.isAttempted ? "#475569" : "#94A3B8"}
                      fontFamily="monospace"
                    >
                      {String(m.moduleNumber).padStart(2, "0")}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Phase footer indicator tags */}
          <div className="flex justify-between items-center px-12 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
            <span className="text-blue-700 font-medium">Fase Awal (M01–M07)</span>
            <span className="text-slate-600 font-medium">Fase Tengah (M08–M14)</span>
            <span className="text-indigo-700 font-medium">Fase Akhir (M15–M21)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
