"use client";

import React from "react";
import { SpeedAccuracyQuadrant as QuadrantType } from "@/features/scoring/quadrantMatrix";
import { DomainScoreSummary } from "@/features/scoring/calculator";
import { DOMAIN_LABELS } from "@/lib/curriculum";

interface SpeedAccuracyQuadrantProps {
  overallAccuracy: number;
  overallMedianSec: number;
  overallCategory: QuadrantType;
  domainScores: DomainScoreSummary[];
}

export function SpeedAccuracyQuadrant({
  overallAccuracy,
  overallMedianSec,
  overallCategory,
  domainScores,
}: SpeedAccuracyQuadrantProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Analisis Kuadran: Kecepatan vs. Akurasi (Speed vs. Accuracy Matrix)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Menilai keseimbangan antara ketelitian pemecahan masalah dengan kecepatan pengambilan keputusan di bawah tekanan waktu.
        </p>
      </div>

      {/* 4-Quadrant Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Top-Left: Slow + Accurate */}
        <div
          className={`p-4 rounded-lg border transition-all ${
            overallCategory === "SLOW_ACCURATE"
              ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs"
              : "border-slate-200 bg-slate-50/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Akurat Namun Lambat (Slow + Accurate)
            </span>
            {overallCategory === "SLOW_ACCURATE" && (
              <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                Posisi Anda
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Karakteristik: Perfeksionis. Akurasi tinggi (≥ 75%), namun waktu berpikir lambat (&gt; 8s/soal). Berisiko kehabisan waktu pada modul 60 detik.
          </p>
        </div>

        {/* Top-Right: Fast + Accurate (Target Zone) */}
        <div
          className={`p-4 rounded-lg border transition-all ${
            overallCategory === "FAST_ACCURATE"
              ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs"
              : "border-slate-200 bg-slate-50/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center">
              ★ Cepat & Akurat (Fast + Accurate)
            </span>
            {overallCategory === "FAST_ACCURATE" && (
              <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                Posisi Anda (Optimal)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Karakteristik: Zona performa optimal. Kecepatan reaksi tinggi (≤ 8s/soal) dengan akurasi superior (≥ 75%).
          </p>
        </div>

        {/* Bottom-Left: Slow + Inaccurate */}
        <div
          className={`p-4 rounded-lg border transition-all ${
            overallCategory === "SLOW_INACCURATE"
              ? "border-red-600 bg-red-50/70 ring-2 ring-red-500/20 shadow-xs"
              : "border-slate-200 bg-slate-50/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lambat & Belum Akurat (Slow + Inaccurate)
            </span>
            {overallCategory === "SLOW_INACCURATE" && (
              <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                Posisi Anda
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Karakteristik: Hambatan konseptual. Membutuhkan waktu lama (&gt; 8s/soal) dengan akurasi di bawah 75%. Perlu penguatan fondasi konsep.
          </p>
        </div>

        {/* Bottom-Right: Fast + Inaccurate */}
        <div
          className={`p-4 rounded-lg border transition-all ${
            overallCategory === "FAST_INACCURATE"
              ? "border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs"
              : "border-slate-200 bg-slate-50/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Cepat Namun Kurang Teliti (Fast + Inaccurate)
            </span>
            {overallCategory === "FAST_INACCURATE" && (
              <span className="text-xs bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">
                Posisi Anda
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Karakteristik: Impulsif. Merespons sangat cepat (≤ 8s/soal) namun akurasi rendah (&lt; 75%) akibat sering terkecoh opsi jebakan.
          </p>
        </div>
      </div>

      {/* Domain Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="py-2.5 px-3">Domain Kognitif</th>
              <th className="py-2.5 px-3 text-center">Soal</th>
              <th className="py-2.5 px-3 text-center">Akurasi</th>
              <th className="py-2.5 px-3 text-center">Median Waktu</th>
              <th className="py-2.5 px-3 text-center">Timeout</th>
              <th className="py-2.5 px-3">Klasifikasi Kuadran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {domainScores.map((ds) => {
              const label = DOMAIN_LABELS[ds.domain] || ds.domain;
              const medSec = (ds.medianResponseTimeMs / 1000).toFixed(1);

              return (
                <tr key={ds.domain} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900">{label}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{ds.attempted} / {ds.totalItems}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`font-bold ${
                        ds.accuracy >= 75
                          ? "text-emerald-700"
                          : ds.accuracy >= 50
                          ? "text-amber-700"
                          : "text-red-700"
                      }`}
                    >
                      {ds.accuracy}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">{medSec}s</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{ds.timeoutRate}%</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block font-semibold text-slate-800 text-[11px]">
                      {ds.quadrantLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
