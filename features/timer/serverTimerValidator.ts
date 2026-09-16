/**
 * Server-authoritative Timer Validator
 * Enforces server-side time verification, grace windows for network latency,
 * and prevents client-side timer manipulation.
 */

export const NETWORK_GRACE_PERIOD_MS = 3000; // 3.0 seconds buffer for network transit

export interface TimerValidationResult {
  isValid: boolean;
  isExpired: boolean;
  remainingMs: number;
  elapsedMs: number;
  serverNow: number;
}

export function validateModuleTime(
  startedAt: Date | string,
  timeLimitMs: number,
  submissionTime: Date = new Date()
): TimerValidationResult {
  const startMs = typeof startedAt === "string" ? new Date(startedAt).getTime() : startedAt.getTime();
  const nowMs = submissionTime.getTime();
  const expiresAtMs = startMs + timeLimitMs;
  const elapsedMs = nowMs - startMs;
  const remainingMs = expiresAtMs - nowMs;

  const isExpired = nowMs >= expiresAtMs;
  // A submission is accepted if submitted before expiration plus the network grace window
  const isValid = nowMs <= expiresAtMs + NETWORK_GRACE_PERIOD_MS;

  return {
    isValid,
    isExpired,
    remainingMs: Math.max(0, remainingMs),
    elapsedMs,
    serverNow: nowMs,
  };
}

export function calculateModuleExpiry(startedAt: Date, timeLimitMs: number): Date {
  return new Date(startedAt.getTime() + timeLimitMs);
}
