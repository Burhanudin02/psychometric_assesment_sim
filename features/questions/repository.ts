import { prisma } from "@/lib/db";
import { QuestionItem } from "./types";
import seedData from "@/data/seedQuestions.json";
import { getModuleConfig } from "@/lib/curriculum";

export async function getAllQuestions(includeNonActive = false): Promise<QuestionItem[]> {
  try {
    const dbQuestions = await prisma.question.findMany({
      where: includeNonActive
        ? undefined
        : {
            active: true,
            qualityStatus: "ACTIVE",
          },
      orderBy: { id: "asc" },
    });

    if (dbQuestions && dbQuestions.length > 0) {
      return dbQuestions.map((q) => ({
        id: q.id,
        domain: q.domain,
        subtopic: q.subtopic,
        questionType: q.questionType as any,
        difficulty: q.difficulty as any,
        qualityStatus: q.qualityStatus as any,
        prompt: q.prompt,
        svgData: q.svgData,
        image: q.image,
        imagePosition: q.imagePosition as any,
        options: q.options as any,
        correctAnswer: q.correctAnswer,
        rule: (q as any).rule || (q.metadata as any)?.rule || undefined,
        explanation: q.explanation,
        solvingStrategy: q.solvingStrategy,
        tags: q.tags,
        estimatedDifficulty: q.estimatedDifficulty,
        isProcedural: q.isProcedural,
        generatorSeed: q.generatorSeed,
        active: q.active,
        version: q.version,
        reportCount: q.reportCount,
        lastReviewedAt: q.lastReviewedAt?.toISOString() || null,
        lastReviewedBy: q.lastReviewedBy,
        reviewNote: q.reviewNote,
        metadata: q.metadata as any,
      }));
    }
  } catch (err) {
    console.warn("Falling back to local seedQuestions.json:", err);
  }

  const list = seedData as any[];
  const filtered = includeNonActive
    ? list
    : list.filter((q) => q.active !== false && q.qualityStatus !== "DEPRECATED");

  return filtered.map((q) => ({
    ...q,
    qualityStatus: q.qualityStatus || "ACTIVE",
  })) as QuestionItem[];
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
        qualityStatus: dbQ.qualityStatus as any,
        prompt: dbQ.prompt,
        svgData: dbQ.svgData,
        image: dbQ.image,
        imagePosition: dbQ.imagePosition as any,
        options: dbQ.options as any,
        correctAnswer: dbQ.correctAnswer,
        rule: (dbQ as any).rule || (dbQ.metadata as any)?.rule || undefined,
        explanation: dbQ.explanation,
        solvingStrategy: dbQ.solvingStrategy,
        tags: dbQ.tags,
        estimatedDifficulty: dbQ.estimatedDifficulty,
        isProcedural: dbQ.isProcedural,
        generatorSeed: dbQ.generatorSeed,
        active: dbQ.active,
        version: dbQ.version,
        reportCount: dbQ.reportCount,
        lastReviewedAt: dbQ.lastReviewedAt?.toISOString() || null,
        lastReviewedBy: dbQ.lastReviewedBy,
        reviewNote: dbQ.reviewNote,
        metadata: dbQ.metadata as any,
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
  const subtopic = config?.subtopic;

  // Only ACTIVE questions are served to test candidates
  const all = await getAllQuestions(false);
  let filtered = all.filter((q) => q.domain === domain);

  if (subtopic) {
    const subFiltered = filtered.filter((q) => q.subtopic === subtopic);
    if (subFiltered.length >= targetCount) {
      filtered = subFiltered;
    } else if (subFiltered.length > 0) {
      // Prioritize subtopic items, then top up with other items in domain
      const remaining = filtered.filter((q) => q.subtopic !== subtopic);
      filtered = [...subFiltered, ...remaining];
    }
  }

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
  qualityStatus?: string;
  limit?: number;
}): Promise<QuestionItem[]> {
  const all = await getAllQuestions(true);
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
  if (params.qualityStatus && params.qualityStatus !== "ALL") {
    filtered = filtered.filter((q) => q.qualityStatus === params.qualityStatus);
  }

  const limit = params.limit ?? 10;
  return filtered.slice(0, limit);
}
