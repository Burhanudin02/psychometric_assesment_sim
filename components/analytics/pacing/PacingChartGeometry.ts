import { ModulePerformanceItem } from "@/features/scoring/pacingMetrics";

export const CHART_DIMENSIONS = {
  chartWidth: 840,
  paddingLeft: 48,
  paddingRight: 32,
  accChartHeight: 160,
  accPaddingTop: 20,
  accPaddingBottom: 28,
  timeChartHeight: 150,
  timePaddingTop: 20,
  timePaddingBottom: 28,
};

export const usableWidth =
  CHART_DIMENSIONS.chartWidth - CHART_DIMENSIONS.paddingLeft - CHART_DIMENSIONS.paddingRight;
export const usableAccHeight =
  CHART_DIMENSIONS.accChartHeight - CHART_DIMENSIONS.accPaddingTop - CHART_DIMENSIONS.accPaddingBottom;
export const usableTimeHeight =
  CHART_DIMENSIONS.timeChartHeight - CHART_DIMENSIONS.timePaddingTop - CHART_DIMENSIONS.timePaddingBottom;

export function getX(moduleNum: number): number {
  return CHART_DIMENSIONS.paddingLeft + ((moduleNum - 1) / 20) * usableWidth;
}

export function getYAcc(accuracyPct: number): number {
  const clamped = Math.max(0, Math.min(100, accuracyPct));
  return CHART_DIMENSIONS.accPaddingTop + (1 - clamped / 100) * usableAccHeight;
}

export function calculateMaxResponseTimeSec(modules: ModulePerformanceItem[]): number {
  let maxSec = 10;
  for (const m of modules) {
    if (m.medianResponseTimeMs) {
      const sec = m.medianResponseTimeMs / 1000;
      if (sec > maxSec) maxSec = sec;
    }
  }
  return Math.min(25, Math.max(12, Math.ceil(maxSec / 2) * 2));
}

export function getYTime(timeSec: number, maxResponseTimeSec: number): number {
  const clamped = Math.max(0, Math.min(maxResponseTimeSec, timeSec));
  return (
    CHART_DIMENSIONS.timePaddingTop +
    (1 - clamped / maxResponseTimeSec) * usableTimeHeight
  );
}

export function buildAccuracyPathSegments(modules: ModulePerformanceItem[]): string[] {
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
}

export function buildResponseTimePathSegments(
  modules: ModulePerformanceItem[],
  maxResponseTimeSec: number
): string[] {
  const segments: string[] = [];
  let currentSegment: { x: number; y: number }[] = [];

  for (const m of modules) {
    if (m.isAttempted && m.medianResponseTimeMs !== null) {
      const sec = m.medianResponseTimeMs / 1000;
      currentSegment.push({ x: getX(m.moduleNumber), y: getYTime(sec, maxResponseTimeSec) });
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
}

export function calculatePhaseBands() {
  const stepX = usableWidth / 20;
  const phase1X = CHART_DIMENSIONS.paddingLeft - stepX / 2;
  const phase1W = getX(7) + stepX / 2 - phase1X;
  const phase2X = getX(8) - stepX / 2;
  const phase2W = getX(14) + stepX / 2 - phase2X;
  const phase3X = getX(15) - stepX / 2;
  const phase3W = getX(21) + stepX / 2 - phase3X;

  return { phase1X, phase1W, phase2X, phase2W, phase3X, phase3W };
}
