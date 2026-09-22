"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Target, Zap, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOMAIN_LABELS } from "@/lib/curriculum";

export default function PracticeHubPage() {
  const router = useRouter();

  const [selectedDomain, setSelectedDomain] = useState<string>("NUMERICAL_REASONING");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [drillMode, setDrillMode] = useState<string>("LEARNING");
  const [questionCount, setQuestionCount] = useState<number>(10);

  const domains = Object.entries(DOMAIN_LABELS).filter(([k]) => k !== "MULTI_DOMAIN");

  const handleStartDrill = () => {
    router.push(
      `/practice/${selectedDomain}?difficulty=${selectedDifficulty}&mode=${drillMode}&count=${questionCount}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Beranda</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Mode Latihan Terarah (Practice Drills)
            </h1>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Konfigurasi Latihan Kognitif
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih rumpun domain spesifik, tingkat kesulitan, dan metode latihan untuk melatih penguasaan konsep atau kecepatan.
            </p>
          </div>

          <div className="space-y-6">
            {/* Domain Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                1. Pilih Domain Penalaran
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {domains.map(([key, label]) => {
                  const isSelected = selectedDomain === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDomain(key)}
                      className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-900 bg-blue-50/80 text-blue-950 ring-2 ring-blue-600/30"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drill Mode Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                2. Pilih Metode Latihan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDrillMode("LEARNING")}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    drillMode === "LEARNING"
                      ? "border-blue-900 bg-blue-50/80 text-blue-950 ring-2 ring-blue-600/30"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <BookOpen className="h-4 w-4 text-blue-800" />
                    <span className="text-xs font-bold">Mode Belajar</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Tanpa batas waktu. Penjelasan dan pembahasan solusi langsung ditampilkan setelah menjawab.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDrillMode("TIMED_DRILL")}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    drillMode === "TIMED_DRILL"
                      ? "border-blue-900 bg-blue-50/80 text-blue-950 ring-2 ring-blue-600/30"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-800" />
                    <span className="text-xs font-bold">Timed Drill</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Waktu standar (~15 detik/soal). Melatih manajemen waktu pengerjaan normal.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDrillMode("SPEED_DRILL")}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    drillMode === "SPEED_DRILL"
                      ? "border-blue-900 bg-blue-50/80 text-blue-950 ring-2 ring-blue-600/30"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold">Speed Drill</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Batas waktu agresif (7 detik/soal). Melatih kecepatan refleks pola kognitif tinggi.
                  </p>
                </button>
              </div>
            </div>

            {/* Difficulty & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  3. Tingkat Kesulitan
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ALL">Semua Tingkat Kesulitan</option>
                  <option value="EASY">Mudah (Easy)</option>
                  <option value="MODERATE">Sedang (Moderate)</option>
                  <option value="HARD">Sulit (Hard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  4. Jumlah Butir Soal
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={5}>5 Soal (Drill Singkat)</option>
                  <option value={10}>10 Soal (Rekomendasi)</option>
                  <option value={15}>15 Soal (Drill Lengkap)</option>
                  <option value={20}>20 Soal (Intensif)</option>
                </select>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                size="lg"
                onClick={handleStartDrill}
                className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 font-bold px-8 shadow-sm"
              >
                <span>Mulai Sesi Latihan</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
