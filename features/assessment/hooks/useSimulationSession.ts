"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuestionItem } from "@/features/questions/types";

export interface UseSimulationSessionParams {
  sessionId: string;
  onSessionLoaded?: () => void;
}

export function useSimulationSession({
  sessionId,
  onSessionLoaded,
}: UseSimulationSessionParams) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentModuleNum, setCurrentModuleNum] = useState<number>(1);
  const [totalModules, setTotalModules] = useState<number>(21);
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [moduleInstructions, setModuleInstructions] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const questionStartTimes = useRef<Record<string, number>>({});
  const moduleStartTimeRef = useRef<number>(Date.now());
  const hasSubmittedRef = useRef<boolean>(false);

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

      const now = Date.now();
      moduleStartTimeRef.current = now;
      const initialTimes: Record<string, number> = {};
      for (const q of data.questions || []) {
        initialTimes[q.id] = now;
      }
      questionStartTimes.current = initialTimes;

      hasSubmittedRef.current = false;
      setIsLoading(false);

      if (onSessionLoaded) {
        onSessionLoaded();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal terhubung ke server.");
      setIsLoading(false);
    }
  }, [sessionId, router, onSessionLoaded]);

  const selectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const getAnswersPayload = useCallback(() => {
    return questions.map((q) => {
      const sel = selectedAnswers[q.id] || null;
      const qStart = questionStartTimes.current[q.id] || moduleStartTimeRef.current;
      const elapsed = Math.max(500, Date.now() - qStart);
      return {
        questionId: q.id,
        selectedAnswer: sel,
        responseTimeMs: elapsed,
      };
    });
  }, [questions, selectedAnswers]);

  const submitModule = useCallback(
    async (isTimedOut = false) => {
      if (hasSubmittedRef.current || isSubmitting) return;
      hasSubmittedRef.current = true;
      setIsSubmitting(true);

      const answersPayload = getAnswersPayload();

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
    [sessionId, currentModuleNum, getAnswersPayload, isSubmitting, router, fetchSessionState]
  );

  return {
    isLoading,
    isSubmitting,
    errorMsg,
    currentModuleNum,
    totalModules,
    moduleTitle,
    moduleInstructions,
    expiresAt,
    serverTime,
    questions,
    selectedAnswers,
    fetchSessionState,
    selectAnswer,
    submitModule,
    getAnswersPayload,
  };
}
