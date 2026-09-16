import { describe, it, expect } from "vitest";
import {
  validateModuleTime,
  calculateModuleExpiry,
  NETWORK_GRACE_PERIOD_MS,
} from "../../features/timer/serverTimerValidator";

describe("Server-Authoritative Timer Validator", () => {
  it("should calculate exact module expiration based on time limit", () => {
    const startedAt = new Date("2025-01-01T10:00:00.000Z");
    const expiresAt = calculateModuleExpiry(startedAt, 60000);
    expect(expiresAt.toISOString()).toBe("2025-01-01T10:01:00.000Z");
  });

  it("should accept submissions made within module time", () => {
    const startedAt = new Date("2025-01-01T10:00:00.000Z");
    const submissionTime = new Date("2025-01-01T10:00:45.000Z"); // 45s elapsed
    const result = validateModuleTime(startedAt, 60000, submissionTime);

    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(false);
    expect(result.remainingMs).toBe(15000);
  });

  it("should accept submissions submitted during the 3000ms grace window", () => {
    const startedAt = new Date("2025-01-01T10:00:00.000Z");
    const submissionTime = new Date("2025-01-01T10:01:01.500Z"); // 1.5s after expiry
    const result = validateModuleTime(startedAt, 60000, submissionTime);

    expect(result.isExpired).toBe(true);
    expect(result.isValid).toBe(true); // within 3000ms grace
  });

  it("should reject submissions submitted past the grace window", () => {
    const startedAt = new Date("2025-01-01T10:00:00.000Z");
    const submissionTime = new Date("2025-01-01T10:01:05.000Z"); // 5.0s after expiry
    const result = validateModuleTime(startedAt, 60000, submissionTime);

    expect(result.isExpired).toBe(true);
    expect(result.isValid).toBe(false);
  });
});
