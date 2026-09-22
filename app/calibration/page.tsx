"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, HelpCircle, ArrowRight, RotateCcw, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";
import { DOMAIN_LABELS } from "@/lib/curriculum";

export default function CalibrationPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/calibration");
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleSelectAnswer = (ansId: string) => {
    const curQ = questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [curQ.id]: ansId,
    }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finish calibration
      setIsLoading(true);
      const attempts = questions.map((q) => ({
        domain: q.domain,
        isCorrect: selectedAnswers[q.id] === q.correctAnswer,
      }));

      try {
        const res = await fetch("/api/calibration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attempts }),
        });
        const resData = await res.json();
        if (resData.success) {
          setEvaluation(resData.evaluation);
          setIsFinished(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-600">Menyiapkan butir uji kalibrasi...</span>
        </div>
      </div>
    );
  }

  if (isFinished && evaluation) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center space-x-2 text-blue-900 mb-1">
              <Activity className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Hasil Uji Diagnostik Awal</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Profil Kalibrasi Kognitif
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {evaluation.diagnosticSummary}
            </p>
          </div>

          <div className="mb-6 p-4 rounded-lg bg-blue-50/80 border border-blue-200 flex items-start space-x-3 text-xs text-blue-950">
            <ShieldCheck className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Disclaimer Diagnostik: </span>
              Ini adalah diagnostik pelatihan mandiri untuk memetakan kekuatan relatif Anda, bukan merupakan skor asesmen resmi dari instansi atau institusi mana pun.
            </div>
          </div>

          {/* Domain ratings list */}
          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evaluasi per Domain Kognitif
            </h3>
            {evaluation.domainRatings.map((item: any) => {
              const label = DOMAIN_LABELS[item.domain] || item.domain;
              const isStrong = item.rating.includes("Strong");
              const isModerate = item.rating.includes("Moderate");

              return (
                <div
                  key={item.domain}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
                >
                  <span className="font-semibold text-slate-800">{label}</span>
                  <span
                    className={`font-bold px-2.5 py-1 rounded-full ${
                      isStrong
                        ? "bg-emerald-100 text-emerald-800"
                        : isModerate
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.rating} ({item.correct}/{item.total})
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/simulation/prepare" className="w-full sm:w-auto">
              <Button size="sm" className="w-full bg-blue-900 hover:bg-blue-800 font-bold">
                Lanjut ke Simulasi 21 Modul
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const curQ = questions[currentIndex];
  const curAnswer = selectedAnswers[curQ.id] || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Keluar</span>
            </Button>
          </Link>
          <span className="text-xs font-bold text-slate-700">
            Uji Kalibrasi: Soal {currentIndex + 1} dari {questions.length}
          </span>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full p-4 sm:p-6">
        <QuestionRenderer
          question={curQ}
          questionIndex={currentIndex}
          totalQuestionsInModule={questions.length}
          selectedAnswer={curAnswer}
          onSelectAnswer={handleSelectAnswer}
        />

        <div className="mt-6 flex justify-end">
          <Button
            size="default"
            disabled={!curAnswer}
            onClick={handleNext}
            className="bg-blue-900 hover:bg-blue-800 font-bold text-xs sm:text-sm px-6"
          >
            <span>{currentIndex === questions.length - 1 ? "Selesai & Lihat Profil" : "Lanjut Soal Berikutnya"}</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
