import { describe, it, expect } from "vitest";
import { calculateSessionMetrics, calculateMedian } from "../../features/scoring/calculator";
import { evaluateQuadrant } from "../../features/scoring/quadrantMatrix";
import { analyzeFatigue } from "../../features/scoring/fatigueAnalyzer";

describe("Scoring & Quadrant Matrix Engine", () => {
  it("should calculate median correctly for odd and even arrays", () => {
    expect(calculateMedian([5, 1, 9])).toBe(5);
    expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    expect(calculateMedian([])).toBe(0);
  });

  it("should evaluate speed-accuracy quadrants accurately", () => {
    // Fast + Accurate: Acc >= 75%, MedTime <= 8s
    const fastAcc = evaluateQuadrant(85, 6.5);
    expect(fastAcc.quadrant).toBe("FAST_ACCURATE");

    // Fast + Inaccurate: Acc < 75%, MedTime <= 8s
    const fastInacc = evaluateQuadrant(60, 5.0);
    expect(fastInacc.quadrant).toBe("FAST_INACCURATE");

    // Slow + Accurate: Acc >= 75%, MedTime > 8s
    const slowAcc = evaluateQuadrant(90, 11.2);
    expect(slowAcc.quadrant).toBe("SLOW_ACCURATE");

    // Slow + Inaccurate: Acc < 75%, MedTime > 8s
    const slowInacc = evaluateQuadrant(45, 12.0);
    expect(slowInacc.quadrant).toBe("SLOW_INACCURATE");
  });

  it("should calculate session metrics and domain aggregations properly", () => {
    const mockAttempts = [
      {
        questionId: "Q1",
        moduleId: "M1",
        moduleNumber: 1,
        domain: "NUMERICAL_REASONING",
        selectedAnswer: "B",
        correctAnswer: "B",
        isCorrect: true,
        isAnswered: true,
        responseTimeMs: 4000,
        isTimedOut: false,
      },
      {
        questionId: "Q2",
        moduleId: "M1",
        moduleNumber: 1,
        domain: "NUMERICAL_REASONING",
        selectedAnswer: "C",
        correctAnswer: "A",
        isCorrect: false,
        isAnswered: true,
        responseTimeMs: 6000,
        isTimedOut: false,
      },
      {
        questionId: "Q3",
        moduleId: "M2",
        moduleNumber: 2,
        domain: "NUMBER_SERIES",
        selectedAnswer: null,
        correctAnswer: "D",
        isCorrect: false,
        isAnswered: false,
        responseTimeMs: 0,
        isTimedOut: true,
      },
    ];

    const results = calculateSessionMetrics(mockAttempts, 1);

    expect(results.totalQuestions).toBe(3);
    expect(results.totalAnswered).toBe(2);
    expect(results.totalCorrect).toBe(1);
    expect(results.totalIncorrect).toBe(1);
    expect(results.totalUnanswered).toBe(1);
    expect(results.accuracy).toBe(50.0);
    expect(results.timeoutCount).toBe(1);
    expect(results.domainScores.length).toBe(2);

    const numDomain = results.domainScores.find((d) => d.domain === "NUMERICAL_REASONING");
    expect(numDomain).toBeDefined();
    expect(numDomain?.accuracy).toBe(50.0);
    expect(numDomain?.attempted).toBe(2);
  });

  it("should detect cognitive fatigue decay in final modules", () => {
    const modulesData = Array.from({ length: 21 }).map((_, i) => ({
      moduleNumber: i + 1,
      // Early modules 1-7 have 90% accuracy, late modules 15-21 have 60% accuracy
      accuracy: i < 7 ? 90 : i < 14 ? 80 : 60,
    }));

    const fatigue = analyzeFatigue(modulesData);
    expect(fatigue.earlyAccuracy).toBe(90);
    expect(fatigue.lateAccuracy).toBe(60);
    expect(fatigue.fatigueIndex).toBe(30.0);
    expect(fatigue.hasFatigueDecay).toBe(true);
  });
});
