"use client";

import React from "react";
import { TimerAlertLevel } from "@/features/timer/useAssessmentTimer";
import { Clock } from "lucide-react";

interface AssessmentHeaderProps {
  currentModuleNum: number;
  totalModules: number;
  moduleTitle: string;
  formattedTime: string;
  alertLevel: TimerAlertLevel;
}

export function AssessmentHeader({
  currentModuleNum,
  totalModules,
  moduleTitle,
  formattedTime,
  alertLevel,
}: AssessmentHeaderProps) {
  const alertStyles = {
    normal: "bg-slate-900 text-white border-slate-800",
    warning: "bg-amber-600 text-white border-amber-500 animate-pulse",
    danger: "bg-red-600 text-white border-red-500 animate-pulse font-extrabold",
  }[alertLevel];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / Simulator Title */}
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-900 text-sm font-bold text-white tracking-wider">
            CAS
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight sm:text-base">
              Cognitive Assessment Simulator
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Simulasi Pelatihan Kognitif & Kecepatan Berpikir
            </p>
          </div>
        </div>

        {/* Center: Module indicator */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Modul {String(currentModuleNum).padStart(2, "0")} dari {totalModules}
          </span>
          <span className="text-sm font-bold text-slate-900 max-w-[280px] truncate text-center">
            {moduleTitle}
          </span>
        </div>

        {/* Right: Server-Synchronized Timer Widget (Official manual p.8 spec) */}
        <div
          className={`flex items-center space-x-2 rounded-md border px-3.5 py-1.5 shadow-xs transition-all ${alertStyles}`}
          role="timer"
          aria-live="polite"
        >
          <Clock className="h-4 w-4" />
          <span className="font-mono text-base font-bold tracking-wider">
            {formattedTime}
          </span>
        </div>
      </div>
    </header>
  );
}
