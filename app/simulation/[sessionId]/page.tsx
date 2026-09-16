"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { ModuleProgressSidebar } from "@/components/assessment/ModuleProgressSidebar";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";
import { useAssessmentTimer } from "@/features/timer/useAssessmentTimer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { QuestionItem } from "@/features/questions/types";

export default function ActiveSimulationPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active module data
  const [currentModuleNum, setCurrentModuleNum] = useState<number>(1);
  const [totalModules, setTotalModules] = useState<number>(21);
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [moduleInstructions, setModuleInstructions] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  // Answers state for current module: { [questionId]: { answer, responseTimeMs } }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const questionStartTimes = useRef<Record<string, number>>({});
  const moduleStartTimeRef = useRef<number>(Date.now());

  // Prevent duplicate auto-submit triggers
  const hasSubmittedRef = useRef<boolean>(false);

  // Sync state from server
  const fetchSessionState = useCallback(async () => {
    try {
      const res = await fetch(`/api/assessment/sync?sessionId=${sessionId}`);
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || "Gagal memuat status asesmen.");
        setIsLoading(false);
        return;
      }

      if (data.isCompleted) {
        router.replace(`/simulation/${sessionId}/complete`);
        return;
      }

      const mod = data.currentModule;
      setCurrentModuleNum(mod.moduleNumber);
      setTotalModules(data.session.totalModules || 21);
      setModuleTitle(mod.title);
      setModuleInstructions(
        mod.instructions ||
          "Kerjakan seluruh persoalan pada modul ini secara optimal. Waktu pengerjaan terbatas (~1 menit)."
      );
      setExpiresAt(mod.expiresAt);
      setServerTime(data.serverTime);
      setQuestions(data.questions || []);
      setSelectedAnswers(data.savedAnswers || {});

      // Record question start timestamps
      const now = Date.now();
      moduleStartTimeRef.current = now;
      const initialTimes: Record<string, number> = {};
      for (const q of data.questions || []) {
        initialTimes[q.id] = now;
      }
      questionStartTimes.current = initialTimes;

      hasSubmittedRef.current = false;
      setIsLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal terhubung ke server.");
      setIsLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchSessionState();
  }, [fetchSessionState]);

  // Submit current module answers
  const handleSubmitModule = useCallback(
    async (isTimedOut = false) => {
      if (hasSubmittedRef.current || isSubmitting) return;
      hasSubmittedRef.current = true;
      setIsSubmitting(true);

      const answersPayload = questions.map((q) => {
        const sel = selectedAnswers[q.id] || null;
        const qStart = questionStartTimes.current[q.id] || moduleStartTimeRef.current;
        const elapsed = Math.max(500, Date.now() - qStart);

        return {
          questionId: q.id,
          selectedAnswer: sel,
          responseTimeMs: elapsed,
        };
      });

      try {
        const res = await fetch("/api/assessment/submit-module", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            moduleNumber: currentModuleNum,
            answers: answersPayload,
            isTimedOut,
          }),
        });

        const data = await res.json();
        if (data.success) {
          if (data.isFinished) {
            router.replace(`/simulation/${sessionId}/complete`);
          } else {
            // Scroll to top of window for next module
            window.scrollTo({ top: 0, behavior: "smooth" });
            // Re-fetch next module
            await fetchSessionState();
            setIsSubmitting(false);
          }
        } else {
          setErrorMsg(data.error || "Gagal menyimpan jawaban modul.");
          setIsSubmitting(false);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Kesalahan koneksi saat menyimpan modul.");
        setIsSubmitting(false);
      }
    },
    [sessionId, currentModuleNum, questions, selectedAnswers, isSubmitting, router, fetchSessionState]
  );

  // Server-synchronized timer hook
  const { formattedTime, alertLevel } = useAssessmentTimer({
    expiresAt,
    serverNow: serverTime,
    enabled: !isLoading && !isSubmitting,
    onTimeout: () => {
      handleSubmitModule(true);
    },
  });

  // Handle single question selection
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Integrity listeners (Fullscreen exit, Window blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        fetch("/api/assessment/integrity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            eventType: "TAB_HIDDEN",
            metadata: { moduleNumber: currentModuleNum, timestamp: new Date().toISOString() },
          }),
        }).catch(() => {});
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        fetch("/api/assessment/integrity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            eventType: "FULLSCREEN_EXIT",
            metadata: { moduleNumber: currentModuleNum, timestamp: new Date().toISOString() },
          }),
        }).catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [sessionId, currentModuleNum]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          <span className="text-xs font-semibold text-slate-600">
            Menyiapkan Modul {String(currentModuleNum).padStart(2, "0")}...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      {/* Top Fixed Header with live timer */}
      <AssessmentHeader
        currentModuleNum={currentModuleNum}
        totalModules={totalModules}
        moduleTitle={moduleTitle}
        formattedTime={formattedTime}
        alertLevel={alertLevel}
      />

      <div className="flex-1 mx-auto w-full max-w-7xl flex">
        {/* Left Sidebar: 21 Modules progress */}
        <ModuleProgressSidebar
          currentModuleNum={currentModuleNum}
          totalModules={totalModules}
        />

        {/* Main Central Question Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          {errorMsg && (
            <div className="mb-6 flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-900 border border-red-200 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Module Banner Instructions */}
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Instruksi Modul {String(currentModuleNum).padStart(2, "0")}
              </span>
              <span className="text-[11px] text-slate-400">
                Waktu subtes: ~60 detik
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {moduleInstructions}
            </p>
          </div>

          {/* Scrollable Questions List */}
          <div className="space-y-6 pb-24">
            {questions.map((q, idx) => (
              <QuestionRenderer
                key={q.id}
                question={q}
                questionIndex={idx}
                totalQuestionsInModule={questions.length}
                selectedAnswer={selectedAnswers[q.id] || null}
                onSelectAnswer={(ansId) => handleSelectAnswer(q.id, ansId)}
                disabled={isSubmitting}
                sessionId={sessionId}
              />
            ))}
          </div>

          {/* Sticky Bottom Action Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xs py-3 px-4 shadow-lg">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 sm:px-6">
              <span className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
                *Halaman akan otomatis berpindah jika waktu subtes habis. Pastikan melakukan scroll untuk melihat seluruh soal.
              </span>

              <Button
                size="default"
                disabled={isSubmitting}
                onClick={() => handleSubmitModule(false)}
                className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 font-bold px-6 shadow-xs text-xs sm:text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan & Modul Berikutnya</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
