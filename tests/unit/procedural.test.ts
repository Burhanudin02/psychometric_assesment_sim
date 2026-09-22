import { describe, it, expect } from "vitest";
import { generateProceduralSeries } from "../../features/questions/procedural/seriesGenerator";
import { generateProceduralNumerical } from "../../features/questions/procedural/numericalGenerator";
import { generateProceduralPattern } from "../../features/questions/procedural/patternGenerator";
import { generateProceduralSpatial } from "../../features/questions/procedural/spatialGenerator";
import { generateProceduralAttention } from "../../features/questions/procedural/attentionGenerator";

describe("Procedural Question Generators", () => {
  it("should generate valid number series with matching correct answer", () => {
    const q = generateProceduralSeries();
    expect(q.prompt).toContain("?");
    expect(q.options.length).toBeGreaterThanOrEqual(4);
    const correctOpt = q.options.find((o) => o.id === q.correctAnswer);
    expect(correctOpt).toBeDefined();
    expect(q.explanation.length).toBeGreaterThan(10);
  });

  it("should generate valid numerical questions with deterministic calculations", () => {
    const q = generateProceduralNumerical();
    expect(q.options.length).toBe(4);
    const correctOpt = q.options.find((o) => o.id === q.correctAnswer);
    expect(correctOpt).toBeDefined();
  });

  it("should generate valid abstract SVG patterns", () => {
    const q = generateProceduralPattern();
    expect(q.svgData).toContain("<svg");
    expect(q.correctAnswer).toBe("A");
  });

  it("should generate valid 3D spatial rotation questions", () => {
    const q = generateProceduralSpatial();
    expect(q.svgData).toContain("<polygon");
    expect(q.options.length).toBe(4);
  });

  it("should generate valid attention & symbol scanning tasks", () => {
    const q = generateProceduralAttention();
    expect(q.options.length).toBe(2);
    expect(["A", "B"]).toContain(q.correctAnswer);
  });
});
