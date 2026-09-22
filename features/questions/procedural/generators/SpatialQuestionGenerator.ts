import { QuestionType } from "@prisma/client";
import { QuestionItem } from "../../types";
import { IProceduralQuestionGenerator } from "../core/types";

export class SpatialQuestionGenerator implements IProceduralQuestionGenerator {
  readonly domain = "SPATIAL_REASONING";
  readonly questionType = QuestionType.SPATIAL_ROTATION;
  readonly subtopics = ["cube_reasoning"] as const;

  generate(_seed?: number): QuestionItem {
    const svg = `<svg width="180" height="120" viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
    <polygon points="90,20 140,45 90,70 40,45" fill="#E2E8F0" stroke="#0F172A" stroke-width="2"/>
    <polygon points="40,45 90,70 90,115 40,90" fill="#CBD5E1" stroke="#0F172A" stroke-width="2"/>
    <polygon points="140,45 90,70 90,115 140,90" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
    <text x="85" y="50" font-family="sans-serif" font-size="16" fill="#1E3A8A">▲</text>
    <text x="58" y="85" font-family="sans-serif" font-size="16" fill="#0F172A">■</text>
    <text x="110" y="85" font-family="sans-serif" font-size="16" fill="#0F172A">●</text>
  </svg>`;

    return {
      id: `PROC_SPA_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      domain: this.domain,
      subtopic: "cube_reasoning",
      questionType: this.questionType,
      difficulty: "MODERATE",
      prompt:
        "Sebuah kubus memiliki simbol ▲ di sisi atas, ■ di sisi kiri depan, dan ● di sisi kanan depan. Jika kubus diputar 90 derajat searah jarum jam terhadap sumbu vertikalnya, simbol apa yang sekarang berada di sisi kanan depan?",
      svgData: svg,
      options: [
        { id: "A", text: "Sisi yang sebelumnya berada di belakang kubus" },
        { id: "B", text: "Simbol ■ (Segi empat hitam)" },
        { id: "C", text: "Simbol ▲ (Segitiga atas)" },
        { id: "D", text: "Simbol ● tetap di posisinya" },
      ],
      correctAnswer: "A",
      explanation:
        "Ketika kubus diputar 90 derajat searah jarum jam dilihat dari atas, sisi kiri depan (■) berpindah ke posisi kanan depan yang baru, sedangkan sisi yang sebelumnya di belakang kanan berputar ke sisi samping.",
      solvingStrategy: "Visualisasikan rotasi pandangan atas (top-down view) searah jarum jam.",
      tags: ["procedural", "spatial", "cube"],
      estimatedDifficulty: 2.8,
      isProcedural: true,
    };
  }
}
