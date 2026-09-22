"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseSimulationIntegrityParams {
  enabled: boolean;
  policy?: "strict" | "warn" | "off";
  onTerminate: (reason: string) => Promise<void>;
}

export function useSimulationIntegrity({
  enabled,
  policy = "strict",
  onTerminate,
}: UseSimulationIntegrityParams) {
  const [simulationIntegrityActive, setSimulationIntegrityActive] = useState(false);
  const [needsFullscreenPrompt, setNeedsFullscreenPrompt] = useState(false);
  const isTerminatingRef = useRef(false);

  const triggerTermination = useCallback(
    async (reason: string) => {
      if (isTerminatingRef.current) return;
      isTerminatingRef.current = true;
      setSimulationIntegrityActive(false);
      await onTerminate(reason);
    },
    [onTerminate]
  );

  // Check initial fullscreen state
  const checkFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      setSimulationIntegrityActive(true);
      setNeedsFullscreenPrompt(false);
    } else {
      setNeedsFullscreenPrompt(true);
      setSimulationIntegrityActive(false);
    }
  }, []);

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setNeedsFullscreenPrompt(false);
      setTimeout(() => {
        if (document.fullscreenElement) {
          setSimulationIntegrityActive(true);
        }
      }, 200);
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  useEffect(() => {
    if (!enabled || !simulationIntegrityActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        try {
          e.preventDefault();
        } catch {}
        triggerTermination("ESC_PRESSED");
      } else if (e.key === "Alt") {
        triggerTermination("ALT_PRESSED");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerTermination("FULLSCREEN_EXITED");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && policy === "strict") {
        triggerTermination("TAB_OR_WINDOW_LEFT");
      }
    };

    const handleWindowBlur = () => {
      if (!document.hasFocus() && policy === "strict") {
        triggerTermination("WINDOW_BLUR");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      triggerTermination("REFRESH_ATTEMPT");
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
  }, [enabled, simulationIntegrityActive, policy, triggerTermination]);

  return {
    simulationIntegrityActive,
    needsFullscreenPrompt,
    checkFullscreen,
    requestFullscreen,
    isTerminatingRef,
  };
}
