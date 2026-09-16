"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { ModuleProgressSidebar } from "@/components/assessment/ModuleProgressSidebar";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";
import { useAssessmentTimer } from "@/features/timer/useAssessmentTimer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertCircle, Maximize2, ShieldAlert } from "lucide-react";
import { QuestionItem } from "@/features/questions/types";

// Configurable policy as specified in A6 (default: "strict")
const INTEGRITY_POLICY: "strict" | "warn" | "off" = "strict";

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

  // Answers state for current module
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const questionStartTimes = useRef<Record<string, number>>({});
  const moduleStartTimeRef = useRef<number>(Date.now());

  // Prevent duplicate auto-submit triggers & terminations
  const hasSubmittedRef = useRef<boolean>(false);
  const isTerminatingRef = useRef<boolean>(false);

  // A1. Explicit state: simulationIntegrityActive = true ONLY after verified fullscreen
  const [simulationIntegrityActive, setSimulationIntegrityActive] = useState<boolean>(false);
  const [needsFullscreenPrompt, setNeedsFullscreenPrompt] = useState<boolean>(false);

  // Terminate simulation idempotently (Section A7)
  const terminateSimulation = useCallback(
    async (reason: string) => {
      if (isTerminatingRef.current) return;
      isTerminatingRef.current = true;
      setSimulationIntegrityActive(false);

      // Collect pending answers for current module
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
        await fetch("/api/assessment/terminate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            moduleNumber: currentModuleNum,
            answers: answersPayload,
            reason,
          }),
        });
      } catch (err) {
        console.error("Error sending terminate request:", err);
      }

      // Route immediately to dedicated termination screen
      router.replace(`/simulation/${sessionId}/terminated`);
    },
    [sessionId, currentModuleNum, questions, selectedAnswers, router]
  );

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

      if (data.session?.status === "INTEGRITY_TERMINATED") {
        router.replace(`/simulation/${sessionId}/terminated`);
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

      // Verify fullscreen status before enabling integrity monitoring (A1 & A5)
      if (typeof document !== "undefined") {
        if (document.fullscreenElement) {
          setSimulationIntegrityActive(true);
          setNeedsFullscreenPrompt(false);
        } else {
          setNeedsFullscreenPrompt(true);
          setSimulationIntegrityActive(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal terhubung ke server.");
      setIsLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchSessionState();
  }, [fetchSessionState]);

  // Request fullscreen and activate integrity
  const handleActivateFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setNeedsFullscreenPrompt(false);
      // Wait one tick for browser state to settle
      setTimeout(() => {
        if (document.fullscreenElement) {
          setSimulationIntegrityActive(true);
        }
      }, 200);
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  // Submit current module answers normally
  const handleSubmitModule = useCallback(
    async (isTimedOut = false) => {
      if (hasSubmittedRef.current || isSubmitting || isTerminatingRef.current) return;
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
            window.scrollTo({ top: 0, behavior: "smooth" });
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
    enabled: !isLoading && !isSubmitting && !isTerminatingRef.current,
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

  // ============================================================
  // INTEGRITY EVENT LISTENERS (Section A3 - A7)
  // Active ONLY when simulationIntegrityActive === true
  // ============================================================
  useEffect(() => {
    if (!simulationIntegrityActive) return;

    // A3 & A4: Keyboard listeners for Esc and Alt
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        try {
          e.preventDefault();
        } catch {}
        terminateSimulation("ESC_PRESSED");
      } else if (e.key === "Alt") {
        terminateSimulation("ALT_PRESSED");
      }
    };

    // A5: Fullscreen Exit listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        terminateSimulation("FULLSCREEN_EXITED");
      }
    };

    // A6: Visibility Change & Window Blur
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (INTEGRITY_POLICY === "strict") {
          terminateSimulation("TAB_OR_WINDOW_LEFT");
        }
      }
    };

    const handleWindowBlur = () => {
      if (!document.hasFocus()) {
        if (INTEGRITY_POLICY === "strict") {
          terminateSimulation("WINDOW_BLUR");
        }
      }
    };

    // A12: Page Unload / Refresh attempt
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      terminateSimulation("REFRESH_ATTEMPT");
    };

    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [simulationIntegrityActive, terminateSimulation]);

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
    <div className="min-h-screen bg-slate-100/60 flex flex-col select-none">
      {/* Top Fixed Header with live timer */}
      <AssessmentHeader
        currentModuleNum={currentModuleNum}
        totalModules={totalModules}
        moduleTitle={moduleTitle}
        formattedTime={formattedTime}
        alertLevel={alertLevel}
      />

      {/* Initial Fullscreen Lock Overlay if user exited or launched without fullscreen */}
      {needsFullscreenPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="mx-auto h-12 w-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <Maximize2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Aktifkan Layar Penuh</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Mode Simulasi Penuh mewajibkan mode layar penuh aktif untuk memastikan integritas pengerjaan 21 modul.
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-[11px] text-rose-900 text-left flex items-start space-x-2">
              <ShieldAlert className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
              <span>
                Setelah layar penuh aktif, menekan <strong>Esc</strong>, <strong>Alt</strong>, atau keluar dari fullscreen akan langsung <strong>mengakhiri sesi</strong>.
              </span>
            </div>
            <Button
              onClick={handleActivateFullscreen}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 text-xs"
            >
              Masuk Mode Layar Penuh & Mulai Modul
            </Button>
          </div>
        </div>
      )}

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
                className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 font-bold px-6 shadow-xs text-xs sm:text-sm text-white"
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
