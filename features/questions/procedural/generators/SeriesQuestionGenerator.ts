import { QuestionType } from "@prisma/client";
import { QuestionItem } from "../../types";
import { IProceduralQuestionGenerator } from "../core/types";

export class SeriesQuestionGenerator implements IProceduralQuestionGenerator {
  readonly domain = "NUMBER_SERIES";
  readonly questionType = QuestionType.NUMBER_SERIES;
  readonly subtopics = [
    "arithmetic_sequence",
    "geometric_sequence",
    "second_order_differences",
    "alternating_sequence",
  ] as const;

  generate(seed?: number): QuestionItem {
    const rand = seed ? Math.sin(seed) * 10000 : Math.random();
    const patternType = Math.floor(Math.abs(rand) % 4);

    let sequence: number[] = [];
    let nextVal = 0;
    let explanation = "";
    let subtopic = "arithmetic_sequence";

    const start = 2 + Math.floor(Math.abs(rand * 17) % 8);

    if (patternType === 0) {
      // Arithmetic sequence with step
      const step = 3 + Math.floor(Math.abs(rand * 13) % 6);
      sequence = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
      nextVal = start + step * 5;
      explanation = `Pola deret aritmatika dengan penambahan konstan +${step} pada setiap suku berikutnya (${sequence[4]} + ${step} = ${nextVal}).`;
      subtopic = "arithmetic_sequence";
    } else if (patternType === 1) {
      // Geometric sequence (x2 or x3)
      const multiplier = 2;
      sequence = [start, start * 2, start * 4, start * 8, start * 16];
      nextVal = start * 32;
      explanation = `Pola deret geometri dengan pengali konstan x${multiplier} pada setiap suku (${sequence[4]} x ${multiplier} = ${nextVal}).`;
      subtopic = "geometric_sequence";
    } else if (patternType === 2) {
      // Second-order differences (+2, +4, +6, +8...)
      let cur = start;
      sequence = [cur];
      for (let i = 1; i <= 4; i++) {
        cur += i * 2;
        sequence.push(cur);
      }
      nextVal = cur + 5 * 2;
      explanation = `Pola beda bertingkat: selisih antar suku bertambah +2 (+2, +4, +6, +8, maka berikutnya +10). ${cur} + 10 = ${nextVal}.`;
      subtopic = "second_order_differences";
    } else {
      // Alternating (+4, -1, +4, -1...)
      let cur = start + 5;
      sequence = [cur];
      const addVal = 4;
      const subVal = 1;
      for (let i = 0; i < 4; i++) {
        cur = i % 2 === 0 ? cur + addVal : cur - subVal;
        sequence.push(cur);
      }
      nextVal = sequence.length % 2 === 1 ? cur + addVal : cur - subVal;
      explanation = `Pola operasi berselang-seling (+${addVal}, -${subVal}). Suku berikutnya bernilai ${nextVal}.`;
      subtopic = "alternating_sequence";
    }

    const prompt = `Tentukan angka kelanjutan dari deret berikut: ${sequence.join(", ")}, ?`;

    const distractors = [nextVal - 2, nextVal + 2, nextVal + 4];
    const allChoices = [nextVal, ...distractors].sort((a, b) => a - b);

    const options = allChoices.map((val, idx) => ({
      id: String.fromCharCode(65 + idx),
      text: val.toString(),
    }));

    const correctOption = options.find((opt) => opt.text === nextVal.toString())!;

    return {
      id: `PROC_SER_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      domain: this.domain,
      subtopic,
      questionType: this.questionType,
      difficulty: "MODERATE",
      prompt,
      options,
      correctAnswer: correctOption.id,
      explanation,
      solvingStrategy:
        "Analisis selisih antar dua suku pertama secara teliti untuk mengidentifikasi apakah polanya linear atau bertingkat.",
      tags: ["procedural", "number_series", subtopic],
      estimatedDifficulty: 2.5,
      isProcedural: true,
    };
  }
}
