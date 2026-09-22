"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpeedAccuracyQuadrant } from "@/components/analytics/SpeedAccuracyQuadrant";
import { DomainRadarChart } from "@/components/analytics/DomainRadarChart";
import { PacingPerformanceDashboard } from "@/components/analytics/PacingPerformanceDashboard";
import { ErrorTaxonomyList } from "@/components/analytics/ErrorTaxonomyList";
import { RecommendationCards } from "@/components/analytics/RecommendationCards";
import { ResultsHeaderBanner } from "@/components/assessment/results/ResultsHeaderBanner";
import { ResultsMetricsGrid } from "@/components/assessment/results/ResultsMetricsGrid";
import { QuestionReviewAccordion } from "@/components/assessment/results/QuestionReviewAccordion";

export default function SimulationResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch(`/api/assessment/results?sessionId=${sessionId}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setErrorMsg(json.error || "Gagal memuat hasil asesmen.");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Kesalahan jaringan.");
      } finally {
        setIsLoading(false);
      }
    }
    loadResults();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-600">
            Menganalisis data performa 21 subtes...
          </span>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-white p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Gagal Memuat Hasil</h2>
          <p className="text-xs text-slate-600 mb-4">{errorMsg}</p>
          <Link href="/">
            <Button size="sm" variant="outline">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { metrics, recommendations, errorTaxonomy, questionReviewList, pacingSummary } = data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 select-none">
      {/* 1. Header Banner */}
      <ResultsHeaderBanner sessionId={sessionId} />

      {/* 2. Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-8">
        {/* Top KPI Metrics Cards */}
        <ResultsMetricsGrid
          metrics={metrics}
          pacingStabilityScore={pacingSummary?.stabilityScore}
        />

        {/* Longitudinal Pacing & Fatigue Performance Dashboard */}
        {pacingSummary ? (
          <PacingPerformanceDashboard
            pacingSummary={pacingSummary}
            fatigueIndex={metrics.fatigueIndex}
          />
        ) : null}

        {/* Dual Core Visualizations: Quadrant & Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpeedAccuracyQuadrant
            overallAccuracy={metrics.accuracy}
            overallMedianSec={metrics.medianResponseTimeMs / 1000}
            overallCategory={metrics.speedAccuracyCategory}
            domainScores={metrics.domainScores}
          />

          <DomainRadarChart domainScores={metrics.domainScores} />
        </div>

        {/* Error Taxonomy & Training Advisor Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorTaxonomyList errors={errorTaxonomy || []} />
          <RecommendationCards recommendations={recommendations} />
        </div>

        {/* Item-Level Review with Transparent Explanations and Reporting */}
        {questionReviewList && questionReviewList.length > 0 && (
          <QuestionReviewAccordion
            questions={questionReviewList}
            sessionId={sessionId}
          />
        )}
      </main>
    </div>
  );
}
