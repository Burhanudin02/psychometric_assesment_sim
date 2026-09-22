"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";
import { DOMAIN_LABELS } from "@/lib/curriculum";

export default function PracticeRunnerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const domain = params.domain as string;
  const difficulty = searchParams.get("difficulty") || "ALL";
  const mode = searchParams.get("mode") || "LEARNING";
  const count = searchParams.get("count") || "10";

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Performance tracking
  const [userAttempts, setUserAttempts] = useState<
    { questionId: string; isCorrect: boolean; responseTimeMs: number; answer: string }[]
  >([]);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch(
          `/api/practice/questions?domain=${domain}&difficulty=${difficulty}&count=${count}`
        );
        const data = await res.json();
        if (data.success && data.questions.length > 0) {
          setQuestions(data.questions);
          startTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error("Error fetching practice items:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, [domain, difficulty, count]);

  const handleSelectAnswer = (ansId: string) => {
    if (hasAnsweredCurrent && mode === "LEARNING") return;
    setSelectedAnswer(ansId);

    if (mode === "LEARNING") {
      setHasAnsweredCurrent(true);
      const curQ = questions[currentIndex];
      const elapsed = Date.now() - startTimeRef.current;
      setUserAttempts((prev) => [
        ...prev,
        {
          questionId: curQ.id,
          isCorrect: ansId === curQ.correctAnswer,
          responseTimeMs: elapsed,
          answer: ansId,
        },
      ]);
    }
  };

  const handleNext = () => {
    const curQ = questions[currentIndex];
    if (mode !== "LEARNING" && selectedAnswer) {
      const elapsed = Date.now() - startTimeRef.current;
      setUserAttempts((prev) => [
        ...prev,
        {
          questionId: curQ.id,
          isCorrect: selectedAnswer === curQ.correctAnswer,
          responseTimeMs: elapsed,
          answer: selectedAnswer,
        },
      ]);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnsweredCurrent(false);
      startTimeRef.current = Date.now();
    } else {
      setIsFinished(true);
    }
  };

  const handleRetryIncorrect = () => {
    const incorrectIds = new Set(userAttempts.filter((a) => !a.isCorrect).map((a) => a.questionId));
    const retryQuestions = questions.filter((q) => incorrectIds.has(q.id));
    if (retryQuestions.length > 0) {
      setQuestions(retryQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setHasAnsweredCurrent(false);
      setUserAttempts([]);
      setIsFinished(false);
      startTimeRef.current = Date.now();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-600">Menyiapkan butir soal latihan...</span>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const total = userAttempts.length;
    const correct = userAttempts.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgTime =
      total > 0
        ? (userAttempts.reduce((s, a) => s + a.responseTimeMs, 0) / total / 1000).toFixed(1)
        : "0";

    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="mx-auto max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sesi Latihan Selesai
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Domain: {DOMAIN_LABELS[domain] || domain}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Akurasi Latihan</span>
              <span className="text-3xl font-black text-blue-950 mt-1 block">{accuracy}%</span>
              <span className="text-[11px] text-slate-400">{correct} benar dari {total} soal</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Rata-rata Waktu</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{avgTime}s</span>
              <span className="text-[11px] text-slate-400">per butir soal</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {correct < total && (
              <Button
                size="default"
                onClick={handleRetryIncorrect}
                className="w-full bg-blue-900 hover:bg-blue-800 font-bold text-xs"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <span>Ulangi {total - correct} Soal Salah (Drill Topik Lemah)</span>
              </Button>
            )}

            <Link href="/practice" className="block w-full">
              <Button variant="outline" size="default" className="w-full text-xs">
                Pilih Domain Latihan Lain
              </Button>
            </Link>

            <Link href="/" className="block w-full">
              <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const curQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/practice">
            <Button variant="ghost" size="sm" className="text-xs">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Kembali</span>
            </Button>
          </Link>
          <div className="text-xs font-bold text-slate-800">
            {DOMAIN_LABELS[domain] || domain} — Soal {currentIndex + 1} / {questions.length}
          </div>
          <span className="text-xs bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
            {mode === "LEARNING" ? "Mode Belajar" : mode}
          </span>
        </div>
      </header>

      {/* Question Canvas */}
      <main className="flex-1 mx-auto max-w-3xl w-full p-4 sm:p-6 pb-20">
        <QuestionRenderer
          question={curQ}
          questionIndex={currentIndex}
          totalQuestionsInModule={questions.length}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={handleSelectAnswer}
          disabled={hasAnsweredCurrent && mode === "LEARNING"}
        />

        {/* Immediate Explanation in Learning Mode */}
        {hasAnsweredCurrent && mode === "LEARNING" && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              {selectedAnswer === curQ.correctAnswer ? (
                <span className="flex items-center text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-700" />
                  Jawaban Anda Benar!
                </span>
              ) : (
                <span className="flex items-center text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-full">
                  <XCircle className="h-4 w-4 mr-1 text-red-700" />
                  Jawaban Anda Belum Tepat. Kunci: {curQ.correctAnswer}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-700 space-y-1.5 pt-1 border-t border-slate-100">
              <div>
                <strong className="text-slate-900">Penjelasan Lengkap: </strong>
                <span>{curQ.explanation}</span>
              </div>
              {curQ.solvingStrategy && (
                <div>
                  <strong className="text-blue-900">Strategi Cepat: </strong>
                  <span className="text-blue-950 font-medium">{curQ.solvingStrategy}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Button */}
        <div className="mt-6 flex justify-end">
          <Button
            size="default"
            disabled={!selectedAnswer}
            onClick={handleNext}
            className="bg-blue-900 hover:bg-blue-800 font-bold px-6 text-xs sm:text-sm"
          >
            <span>{currentIndex === questions.length - 1 ? "Selesai Latihan" : "Soal Berikutnya"}</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
