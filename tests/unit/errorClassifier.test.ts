import { describe, it, expect } from "vitest";
import { classifyError } from "../../features/review/errorClassifier";

describe("Cognitive Error Taxonomy Classifier", () => {
  it("should classify correct answers as NONE", () => {
    const res = classifyError({
      isCorrect: true,
      isAnswered: true,
      isTimedOut: false,
      responseTimeMs: 3500,
      domain: "NUMERICAL_REASONING",
    });
    expect(res.category).toBe("NONE");
  });

  it("should classify unanswered timeout as TIMEOUT_UNANSWERED", () => {
    const res = classifyError({
      isCorrect: false,
      isAnswered: false,
      isTimedOut: true,
      responseTimeMs: 0,
      domain: "SPATIAL_REASONING",
    });
    expect(res.category).toBe("TIMEOUT_UNANSWERED");
  });

  it("should classify impulsive errors (<1.5s) as CARELESS_RAPID_ERROR", () => {
    const res = classifyError({
      isCorrect: false,
      isAnswered: true,
      isTimedOut: false,
      responseTimeMs: 1100, // 1.1s
      domain: "VERBAL_REASONING",
    });
    expect(res.category).toBe("CARELESS_RAPID_ERROR");
  });

  it("should classify domain-specific errors properly", () => {
    const arithmeticErr = classifyError({
      isCorrect: false,
      isAnswered: true,
      isTimedOut: false,
      responseTimeMs: 5000,
      domain: "NUMERICAL_REASONING",
    });
    expect(arithmeticErr.category).toBe("ARITHMETIC_ERROR");

    const patternErr = classifyError({
      isCorrect: false,
      isAnswered: true,
      isTimedOut: false,
      responseTimeMs: 5000,
      domain: "NUMBER_SERIES",
    });
    expect(patternErr.category).toBe("PATTERN_MISRECOGNITION");

    const spatialErr = classifyError({
      isCorrect: false,
      isAnswered: true,
      isTimedOut: false,
      responseTimeMs: 5000,
      domain: "SPATIAL_REASONING",
    });
    expect(spatialErr.category).toBe("SPATIAL_ORIENTATION_ERROR");
  });
});
