import { prisma } from "@/lib/db";
import { QuestionItem } from "./types";
import seedData from "@/data/seedQuestions.json";
import { getModuleConfig } from "@/lib/curriculum";

export async function getAllQuestions(): Promise<QuestionItem[]> {
  try {
    const dbQuestions = await prisma.question.findMany({
      where: { active: true },
    });
    if (dbQuestions && dbQuestions.length > 0) {
      return dbQuestions.map((q) => ({
        id: q.id,
        domain: q.domain,
        subtopic: q.subtopic,
        questionType: q.questionType as any,
        difficulty: q.difficulty as any,
        prompt: q.prompt,
        svgData: q.svgData,
        options: q.options as any,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        solvingStrategy: q.solvingStrategy,
        tags: q.tags,
        estimatedDifficulty: q.estimatedDifficulty,
        isProcedural: q.isProcedural,
        generatorSeed: q.generatorSeed,
        active: q.active,
        version: q.version,
      }));
    }
  } catch (err) {
    console.warn("Falling back to local seedQuestions.json:", err);
  }

  return seedData as QuestionItem[];
}

export async function getQuestionById(id: string): Promise<QuestionItem | null> {
  try {
    const dbQ = await prisma.question.findUnique({
      where: { id },
    });
    if (dbQ) {
      return {
        id: dbQ.id,
        domain: dbQ.domain,
        subtopic: dbQ.subtopic,
        questionType: dbQ.questionType as any,
        difficulty: dbQ.difficulty as any,
        prompt: dbQ.prompt,
        svgData: dbQ.svgData,
        options: dbQ.options as any,
        correctAnswer: dbQ.correctAnswer,
        explanation: dbQ.explanation,
        solvingStrategy: dbQ.solvingStrategy,
        tags: dbQ.tags,
        estimatedDifficulty: dbQ.estimatedDifficulty,
        isProcedural: dbQ.isProcedural,
        generatorSeed: dbQ.generatorSeed,
        active: dbQ.active,
        version: dbQ.version,
      };
    }
  } catch (e) {
    // fallback
  }

  const local = (seedData as QuestionItem[]).find((q) => q.id === id);
  return local || null;
}

export async function getQuestionsForModule(moduleNumber: number, count?: number): Promise<QuestionItem[]> {
  const config = getModuleConfig(moduleNumber);
  const targetCount = count ?? (config?.defaultItemCount || 8);
  const domain = config?.domain || "NUMERICAL_REASONING";

  const all = await getAllQuestions();
  let filtered = all.filter((q) => q.domain === domain);

  if (filtered.length === 0) {
    filtered = all;
  }

  // Shuffle or deterministic pseudo-random ordering
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, targetCount);
}

export async function getQuestionsByFilter(params: {
  domain?: string;
  subtopic?: string;
  difficulty?: string;
  limit?: number;
}): Promise<QuestionItem[]> {
  const all = await getAllQuestions();
  let filtered = all;

  if (params.domain && params.domain !== "ALL") {
    filtered = filtered.filter((q) => q.domain === params.domain);
  }
  if (params.subtopic && params.subtopic !== "ALL") {
    filtered = filtered.filter((q) => q.subtopic === params.subtopic);
  }
  if (params.difficulty && params.difficulty !== "ALL") {
    filtered = filtered.filter((q) => q.difficulty === params.difficulty);
  }

  const limit = params.limit ?? 10;
  return filtered.slice(0, limit);
}
