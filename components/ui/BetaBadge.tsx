"use client";

import React from "react";
import { BETA_BADGE_TEXT, APP_VERSION } from "@/lib/version";

export interface BetaBadgeProps {
  className?: string;
  minimal?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BetaBadge({
  className = "",
  minimal = false,
  size = "md",
}: BetaBadgeProps) {
  const sizeClasses = {
    sm: "text-[9px] px-1.5 py-0.5",
    md: "text-[11px] px-2 py-0.5",
    lg: "text-xs px-2.5 py-1",
  }[size] || "text-[11px] px-2 py-0.5";

  if (minimal) {
    return (
      <span
        className={`inline-flex items-center font-mono font-medium text-slate-500 bg-slate-100 rounded border border-slate-200 ${sizeClasses} ${className}`}
        title={`Cognitive Assessment Simulator version ${APP_VERSION} (Beta Release)`}
      >
        {BETA_BADGE_TEXT}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold text-blue-900 bg-blue-50/80 rounded-full border border-blue-200/70 shadow-2xs select-none ${sizeClasses} ${className}`}
      title={`Cognitive Assessment Simulator version ${APP_VERSION} (Beta Release)`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
      {BETA_BADGE_TEXT}
    </span>
  );
}
