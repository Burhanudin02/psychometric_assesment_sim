import { QuestionType } from "@prisma/client";
import { QuestionItem } from "../../types";
import { IProceduralQuestionGenerator } from "../core/types";

export class AttentionQuestionGenerator implements IProceduralQuestionGenerator {
  readonly domain = "ATTENTION_CONCENTRATION";
  readonly questionType = QuestionType.SYMBOL_SCANNING;
  readonly subtopics = ["symbol_matching"] as const;

  generate(seed?: number): QuestionItem {
    const rand = seed ? Math.sin(seed) * 10000 : Math.random();
    const chars = ["K", "X", "7", "B", "9", "P", "M"];
    const len = 6;
    const s1Arr: string[] = [];
    for (let i = 0; i < len; i++) {
      const charIdx = Math.floor(Math.abs((rand + i * 13) % chars.length));
      s1Arr.push(chars[charIdx]);
    }
    const s1 = s1Arr.join("");
    const isMatch = (Math.abs(rand * 100) % 2) > 1;
    let s2 = s1;
    if (!isMatch) {
      const changeIdx = Math.floor(Math.abs(rand * 10) % len);
      const newChar = chars[(chars.indexOf(s1[changeIdx]) + 1) % chars.length];
      const s2Arr = [...s1Arr];
      s2Arr[changeIdx] = newChar;
      s2 = s2Arr.join("");
    }

    return {
      id: `PROC_ATT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      domain: this.domain,
      subtopic: "symbol_matching",
      questionType: this.questionType,
      difficulty: "EASY",
      prompt: `Bandingkan kedua kode berikut secara cepat dan teliti:\n\nKode 1: [ ${s1} ]\nKode 2: [ ${s2} ]\n\nApakah kedua kode tersebut SAMA atau BEDA?`,
      options: [
        { id: "A", text: "SAMA (S)" },
        { id: "B", text: "BEDA (B)" },
      ],
      correctAnswer: isMatch ? "A" : "B",
      explanation: `Kode 1 adalah ${s1} dan Kode 2 adalah ${s2}. Keduanya ${
        isMatch ? "tepat SAMA" : "BEDA"
      }.`,
      solvingStrategy: "Bandingkan karakter secara berpasangan dari kiri ke kanan.",
      tags: ["procedural", "attention", "symbol_matching"],
      estimatedDifficulty: 1.5,
      isProcedural: true,
    };
  }
}
