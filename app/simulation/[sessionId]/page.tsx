"use client";

import React, { useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { useAssessmentTimer } from "@/features/timer/useAssessmentTimer";
import { useSimulationSession } from "@/features/assessment/hooks/useSimulationSession";
import { useSimulationIntegrity } from "@/features/assessment/hooks/useSimulationIntegrity";
import { SimulationModuleView } from "@/components/assessment/simulation/SimulationModuleView";
import { SimulationIntegrityGate } from "@/components/assessment/simulation/SimulationIntegrityGate";
import { Loader2, AlertCircle } from "lucide-react";

export default function ActiveSimulationPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // Session state management hook
  const {
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
  } = useSimulationSession({ sessionId });

  // Dedicated termination caller
  const handleTerminate = useCallback(
    async (reason: string) => {
      const answersPayload = getAnswersPayload();
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
      router.replace(`/simulation/${sessionId}/terminated`);
    },
    [sessionId, currentModuleNum, getAnswersPayload, router]
  );

  // Anti-cheat and fullscreen integrity hook
  const {
    needsFullscreenPrompt,
    checkFullscreen,
    requestFullscreen,
    isTerminatingRef,
  } = useSimulationIntegrity({
    enabled: !isLoading,
    policy: "strict",
    onTerminate: handleTerminate,
  });

  useEffect(() => {
    fetchSessionState();
  }, [fetchSessionState]);

  useEffect(() => {
    if (!isLoading) {
      checkFullscreen();
    }
  }, [isLoading, checkFullscreen]);

  // Server-synchronized timer hook
  const { formattedTime, alertLevel } = useAssessmentTimer({
    expiresAt,
    serverNow: serverTime,
    enabled: !isLoading && !isSubmitting && !isTerminatingRef.current,
    onTimeout: () => {
      submitModule(true);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
          <span className="text-xs font-semibold text-slate-600">
            Sinkronisasi modul asesmen dengan server...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 select-none">
      {/* 1. Fullscreen Integrity Gate Overlay */}
      {needsFullscreenPrompt && (
        <SimulationIntegrityGate onActivateFullscreen={requestFullscreen} />
      )}

      {/* 2. Top Navigation & Timer Bar */}
      <AssessmentHeader
        currentModule={currentModuleNum}
        totalModules={totalModules}
        moduleTitle={moduleTitle}
        remainingTimeFormatted={formattedTime}
        alertLevel={alertLevel}
      />

      {/* 3. Error Banner */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* 4. Active Module View */}
      <SimulationModuleView
        currentModuleNum={currentModuleNum}
        totalModules={totalModules}
        moduleTitle={moduleTitle}
        moduleInstructions={moduleInstructions}
        questions={questions}
        selectedAnswers={selectedAnswers}
        isSubmitting={isSubmitting}
        onSelectAnswer={selectAnswer}
        onSubmitModule={() => submitModule(false)}
        sessionId={sessionId}
      />
    </div>
  );
}
