"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FullscreenGate } from "@/components/assessment/FullscreenGate";

export default function SimulationPreparePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartSession = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "FULL_SIMULATION" }),
      });

      const data = await res.json();
      if (data.success && data.sessionId) {
        router.push(`/simulation/${data.sessionId}`);
      } else {
        setErrorMsg(data.error || "Gagal membuat sesi simulasi. Silakan coba kembali.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan jaringan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-center px-4 py-8 sm:py-12">
      {errorMsg && (
        <div className="mx-auto max-w-2xl mb-4 p-3.5 bg-red-100 border border-red-300 rounded-lg text-red-900 text-xs font-semibold">
          {errorMsg}
        </div>
      )}
      <FullscreenGate onStart={handleStartSession} isLoading={isLoading} />
    </div>
  );
}
