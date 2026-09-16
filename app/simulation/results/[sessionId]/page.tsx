"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Target,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpeedAccuracyQuadrant } from "@/components/analytics/SpeedAccuracyQuadrant";
import { DomainRadarChart } from "@/components/analytics/DomainRadarChart";
import { ModuleFatigueTrend } from "@/components/analytics/ModuleFatigueTrend";
import { ErrorTaxonomyList } from "@/components/analytics/ErrorTaxonomyList";
import { RecommendationCards } from "@/components/analytics/RecommendationCards";
import { DOMAIN_LABELS } from "@/lib/curriculum";

export default function SimulationResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Review filter
  const [filterMode, setFilterMode] = useState<"ALL" | "INCORRECT">("INCORRECT");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

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

  const toggleExpand = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  const { metrics, recommendations, errorTaxonomy, questionReviewList, integrityEvents } = data;

  const filteredQuestions = questionReviewList.filter((q: any) => {
    if (filterMode === "INCORRECT") {
      return !q.isCorrect;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Beranda</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-sm font-bold text-slate-900 tracking-tight sm:text-base">
              Hasil & Analisis Pelatihan Simulasi
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/simulation/prepare">
              <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-xs font-semibold">
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                <span>Ulangi Simulasi</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-8">
        {/* Important Training Disclaimer */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs text-xs text-slate-600 flex items-start space-x-3">
          <ShieldCheck className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">Catatan Diagnostik Objektif: </span>
            Seluruh metrik yang disajikan merupakan evaluasi performa latihan berbasis data empiris simulasi kecepatan dan akurasi, bukan merupakan diagnosis psikologis formal maupun prediksi kelulusan resmi.
          </div>
        </div>

        {/* SECTION A: Overview KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Akurasi Keseluruhan</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-2xl font-black text-blue-950">{metrics.accuracy}%</span>
            </div>
            <span className="text-[10px] text-slate-400">{metrics.totalCorrect} benar dari {metrics.totalAnswered} dijawab</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Laju Pengerjaan</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900">{metrics.effectivePaceRate}</span>
              <span className="text-xs text-slate-500">soal/menit</span>
            </div>
            <span className="text-[10px] text-slate-400">Kecepatan throughput modul</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Median Waktu Respon</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900">{(metrics.medianResponseTimeMs / 1000).toFixed(1)}</span>
              <span className="text-xs text-slate-500">detik/soal</span>
            </div>
            <span className="text-[10px] text-slate-400">Rata-rata: {(metrics.averageResponseTimeMs / 1000).toFixed(1)}s</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Modul Timeout</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className={`text-2xl font-black ${metrics.timeoutCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {metrics.timeoutCount}
              </span>
              <span className="text-xs text-slate-500">/ 21 modul</span>
            </div>
            <span className="text-[10px] text-slate-400">Habis waktu sebelum submit</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Skor Kecepatan</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-2xl font-black text-blue-900">{metrics.speedScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-400">Ternormalisasi target domain</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Konsistensi Modul</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900">{metrics.consistencyScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-400">Stabilitas antar 21 subtes</span>
          </div>
        </div>

        {/* SECTION B & C: Speed vs Accuracy Quadrant & Domain Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SpeedAccuracyQuadrant
              overallAccuracy={metrics.accuracy}
              overallMedianSec={metrics.medianResponseTimeMs / 1000}
              overallCategory={metrics.speedAccuracyCategory}
              domainScores={metrics.domainScores}
            />
          </div>
          <div>
            <DomainRadarChart domainScores={metrics.domainScores} />
          </div>
        </div>

        {/* SECTION D: Module Fatigue & Pacing Trend */}
        <ModuleFatigueTrend
          moduleBreakdown={metrics.moduleBreakdown}
          fatigueIndex={metrics.fatigueIndex}
        />

        {/* SECTION E & F: Error Taxonomy & Actionable Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorTaxonomyList errors={errorTaxonomy} />
          <RecommendationCards recommendations={recommendations} />
        </div>

        {/* SECTION G: Detailed Question-by-Question Review */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Review Soal & Strategi Pemecahan Masalah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pelajari langkah penalaran, kunci jawaban sah, dan tips eliminasi pengecoh untuk setiap butir soal.
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-1 rounded-lg bg-slate-100 p-1 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setFilterMode("INCORRECT")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterMode === "INCORRECT"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hanya Soal Salah ({questionReviewList.filter((q: any) => !q.isCorrect).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("ALL")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterMode === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua Soal ({questionReviewList.length})
              </button>
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada soal yang sesuai dengan filter ini.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q: any) => {
                const isExpanded = Boolean(expandedQuestions[q.questionId]);
                const domainLabel = DOMAIN_LABELS[q.domain] || q.domain;

                return (
                  <div
                    key={q.attemptId}
                    className={`rounded-lg border transition-all ${
                      q.isCorrect
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-red-200 bg-red-50/20"
                    }`}
                  >
                    {/* Header Summary Row */}
                    <div
                      onClick={() => toggleExpand(q.questionId)}
                      className="p-4 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center space-x-3">
                        {q.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">
                              Modul {String(q.moduleNumber).padStart(2, "0")}: {domainLabel}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {q.questionId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                            {q.prompt.replace(/\n/g, " ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
                          {(q.responseTimeMs / 1000).toFixed(1)}s
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail View */}
                    {isExpanded && (
                      <div className="border-t border-slate-200/80 p-4 sm:p-5 bg-white space-y-4">
                        <div className="text-sm font-medium text-slate-900 whitespace-pre-line">
                          {q.prompt}
                        </div>

                        {q.svgData && (
                          <div
                            className="p-3 rounded border border-slate-200 bg-slate-50/60 max-w-sm"
                            dangerouslySetInnerHTML={{ __html: q.svgData }}
                          />
                        )}

                        {/* Answer Comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded border border-slate-200 bg-slate-50/50">
                            <span className="font-semibold text-slate-500 block mb-1">Jawaban Anda:</span>
                            <span
                              className={`font-bold text-sm ${
                                q.isCorrect ? "text-emerald-700" : "text-red-700"
                              }`}
                            >
                              {q.selectedAnswer || "(Tidak Dijawab / Kehabisan Waktu)"}
                            </span>
                          </div>
                          <div className="p-3 rounded border border-emerald-200 bg-emerald-50/50">
                            <span className="font-semibold text-emerald-800 block mb-1">Kunci Jawaban Tepat:</span>
                            <span className="font-bold text-sm text-emerald-900">
                              {q.correctAnswer}
                            </span>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                          <div>
                            <span className="font-bold text-blue-950 block mb-0.5">Penjelasan Solusi:</span>
                            <p className="text-blue-900 leading-relaxed">{q.explanation}</p>
                          </div>
                          {q.solvingStrategy && (
                            <div className="pt-2 border-t border-blue-200/60">
                              <span className="font-bold text-blue-950 block mb-0.5">Strategi Efisiensi Waktu:</span>
                              <p className="text-blue-900 leading-relaxed">{q.solvingStrategy}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION H: Simulation Integrity Events (Diagnostics) */}
        {integrityEvents && integrityEvents.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Log Integritas Lingkungan Simulasi ({integrityEvents.length} Peristiwa)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan diagnostik perpindahan fokus layar (misalnya keluar dari layar penuh atau beralih tab browser) selama pengerjaan simulasi.
            </p>
            <div className="divide-y divide-slate-100 text-xs">
              {integrityEvents.map((evt: any) => (
                <div key={evt.id} className="py-2 flex items-center justify-between">
                  <span className="font-mono text-slate-700">{evt.eventType}</span>
                  <span className="text-slate-400">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
