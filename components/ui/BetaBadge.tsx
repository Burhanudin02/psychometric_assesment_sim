"use client";

import React from "react";
import { BETA_BADGE_TEXT, APP_VERSION } from "@/lib/version";

interface BetaBadgeProps {
  className?: string;
  minimal?: boolean;
}

export function BetaBadge({ className = "", minimal = false }: BetaBadgeProps) {
  if (minimal) {
    return (
      <span
        className={`inline-flex items-center text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 ${className}`}
        title={`Cognitive Assessment Simulator version ${APP_VERSION} (Beta Release)`}
      >
        {BETA_BADGE_TEXT}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center text-[11px] font-mono font-semibold text-blue-900 bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-200/70 shadow-2xs select-none ${className}`}
      title={`Cognitive Assessment Simulator version ${APP_VERSION} (Beta Release)`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
      {BETA_BADGE_TEXT}
    </span>
  );
}
