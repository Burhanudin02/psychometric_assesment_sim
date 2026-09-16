"use client";

import React, { useMemo } from "react";
import {
  PacingMetricsSummary,
  computePacingMetrics,
  RawAttemptLike,
} from "@/features/scoring/pacingMetrics";
import { PacingPerformanceDashboard } from "./PacingPerformanceDashboard";

export interface ModuleBreakdownItem {
  moduleNumber: number;
  total: number;
  correct: number;
  accuracy: number;
  medianResponseTimeMs: number;
  timedOut: boolean;
  title?: string;
  domain?: string;
  answered?: number;
  incorrect?: number;
  unanswered?: number;
  isAttempted?: boolean;
}

export interface ModuleFatigueTrendProps {
  moduleBreakdown: ModuleBreakdownItem[];
  fatigueIndex?: number;
  pacingSummary?: PacingMetricsSummary;
}

export function ModuleFatigueTrend({
  moduleBreakdown,
  fatigueIndex = 0,
  pacingSummary,
}: ModuleFatigueTrendProps) {
  // If pacingSummary is already computed and supplied, use it directly
  const summary = useMemo(() => {
    if (pacingSummary) {
      return pacingSummary;
    }

    // Adapt moduleBreakdown into raw attempts if pacingSummary was not provided
    const syntheticAttempts: RawAttemptLike[] = [];
    for (const item of moduleBreakdown) {
      const answeredCount = item.answered !== undefined ? item.answered : Math.round((item.total * item.accuracy) / 100);
      const correctCount = item.correct;
      const incorrectCount = Math.max(0, answeredCount - correctCount);

      for (let i = 0; i < correctCount; i++) {
        syntheticAttempts.push({
          moduleNumber: item.moduleNumber,
          domain: item.domain,
          isAnswered: true,
          isCorrect: true,
          responseTimeMs: item.medianResponseTimeMs || 6000,
          isTimedOut: item.timedOut,
        });
      }

      for (let i = 0; i < incorrectCount; i++) {
        syntheticAttempts.push({
          moduleNumber: item.moduleNumber,
          domain: item.domain,
          isAnswered: true,
          isCorrect: false,
          responseTimeMs: item.medianResponseTimeMs || 6000,
          isTimedOut: item.timedOut,
        });
      }

      // If unanswered items exist or module timed out with 0 answered
      if (item.timedOut && answeredCount === 0) {
        syntheticAttempts.push({
          moduleNumber: item.moduleNumber,
          domain: item.domain,
          isAnswered: false,
          isCorrect: false,
          responseTimeMs: 0,
          isTimedOut: true,
        });
      }
    }

    return computePacingMetrics(syntheticAttempts, 21);
  }, [moduleBreakdown, pacingSummary]);

  return (
    <PacingPerformanceDashboard
      pacingSummary={summary}
      fatigueIndex={fatigueIndex}
    />
  );
}
