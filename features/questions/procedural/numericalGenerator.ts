import { QuestionItem } from "../types";

export function generateProceduralNumerical(seed?: number): QuestionItem {
  const base = 100 + Math.floor(Math.random() * 80) * 10;
  const pct = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
  const discountAmount = (base * pct) / 100;
  const finalPrice = base - discountAmount;

  const prompt = `Sebuah kemasan bahan baku laboratorium berharga normal Rp ${base}.000 mendapat potongan harga promo sebesar ${pct}%. Berapakah harga akhir yang harus dibayar?`;

  const distractors = [finalPrice - 10, finalPrice + 5, base - pct];
  const allChoices = [finalPrice, ...distractors].sort((a, b) => a - b);

  const options = allChoices.map((val, idx) => ({
    id: String.fromCharCode(65 + idx),
    text: `Rp ${val}.000`,
  }));

  const correctOption = options.find((opt) => opt.text === `Rp ${finalPrice}.000`)!;

  return {
    id: `PROC_NUM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    domain: "NUMERICAL_REASONING",
    subtopic: "percentages",
    questionType: "NUMERICAL_MCQ",
    difficulty: "EASY",
    prompt,
    options,
    correctAnswer: correctOption.id,
    explanation: `Potongan harga = Rp ${base}.000 x ${pct}% = Rp ${discountAmount}.000. Harga akhir = Rp ${base}.000 - Rp ${discountAmount}.000 = Rp ${finalPrice}.000.`,
    solvingStrategy: "Kalikan langsung harga normal dengan faktor pengali desimal (1 - persen diskon).",
    tags: ["procedural", "numerical", "percentages"],
    estimatedDifficulty: 1.8,
    isProcedural: true,
  };
}
