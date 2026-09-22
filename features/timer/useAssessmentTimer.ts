"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { formatTime } from "@/lib/utils";

interface UseAssessmentTimerProps {
  expiresAt: string | number | null | undefined;
  serverNow?: string | number | null;
  onTimeout?: () => void;
  enabled?: boolean;
}

export type TimerAlertLevel = "normal" | "warning" | "danger";

export interface AssessmentTimerState {
  remainingMs: number;
  remainingSeconds: number;
  formattedTime: string;
  isExpired: boolean;
  alertLevel: TimerAlertLevel;
}

export function useAssessmentTimer({
  expiresAt,
  serverNow,
  onTimeout,
  enabled = true,
}: UseAssessmentTimerProps): AssessmentTimerState {
  // Compute initial clock drift between client and server
  const clockDriftRef = useRef<number>(0);
  const timeoutCalledRef = useRef<boolean>(false);

  useEffect(() => {
    if (serverNow) {
      const serverMs = typeof serverNow === "string" ? new Date(serverNow).getTime() : serverNow;
      clockDriftRef.current = Date.now() - serverMs;
    }
  }, [serverNow]);

  const targetExpiryMs = typeof expiresAt === "string" ? new Date(expiresAt).getTime() : (expiresAt ?? 0);

  const calculateRemaining = useCallback(() => {
    if (!targetExpiryMs || !enabled) {
      return 60000;
    }
    const currentAdjustedTime = Date.now() - clockDriftRef.current;
    const diff = targetExpiryMs - currentAdjustedTime;
    return Math.max(0, diff);
  }, [targetExpiryMs, enabled]);

  const [remainingMs, setRemainingMs] = useState<number>(calculateRemaining);

  useEffect(() => {
    timeoutCalledRef.current = false;
    setRemainingMs(calculateRemaining());
  }, [targetExpiryMs, calculateRemaining]);

  useEffect(() => {
    if (!enabled || !targetExpiryMs) return;

    const interval = setInterval(() => {
      const rem = calculateRemaining();
      setRemainingMs(rem);

      if (rem <= 0 && !timeoutCalledRef.current) {
        timeoutCalledRef.current = true;
        if (onTimeout) {
          onTimeout();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [enabled, targetExpiryMs, calculateRemaining, onTimeout]);

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const isExpired = remainingMs <= 0;

  let alertLevel: TimerAlertLevel = "normal";
  if (remainingSeconds <= 5) {
    alertLevel = "danger";
  } else if (remainingSeconds <= 15) {
    alertLevel = "warning";
  }

  return {
    remainingMs,
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isExpired,
    alertLevel,
  };
}
