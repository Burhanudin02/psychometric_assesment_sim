import { QuestionItem } from "../types";

export function generateProceduralAttention(): QuestionItem {
  const chars = ["K", "X", "7", "B", "9", "P", "M"];
  const len = 6;
  const s1Arr: string[] = [];
  for (let i = 0; i < len; i++) {
    s1Arr.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  const s1 = s1Arr.join("");
  const isMatch = Math.random() > 0.5;
  let s2 = s1;
  if (!isMatch) {
    const changeIdx = Math.floor(Math.random() * len);
    const newChar = chars[(chars.indexOf(s1[changeIdx]) + 1) % chars.length];
    const s2Arr = [...s1Arr];
    s2Arr[changeIdx] = newChar;
    s2 = s2Arr.join("");
  }

  return {
    id: `PROC_ATT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    domain: "ATTENTION_CONCENTRATION",
    subtopic: "symbol_matching",
    questionType: "SYMBOL_SCANNING",
    difficulty: "EASY",
    prompt: `Bandingkan kedua kode berikut secara cepat dan teliti:\n\nKode 1: [ ${s1} ]\nKode 2: [ ${s2} ]\n\nApakah kedua kode tersebut SAMA atau BEDA?`,
    options: [
      {"id": "A", "text": "SAMA (S)"},
      {"id": "B", "text": "BEDA (B)"}
    ],
    correctAnswer: isMatch ? "A" : "B",
    explanation: `Kode 1 adalah ${s1} dan Kode 2 adalah ${s2}. Keduanya ${isMatch ? "tepat SAMA" : "BEDA"}.`,
    solvingStrategy: "Bandingkan karakter secara berpasangan dari kiri ke kanan.",
    tags: ["procedural", "attention", "symbol_matching"],
    estimatedDifficulty: 1.5,
    isProcedural: true
  };
}
