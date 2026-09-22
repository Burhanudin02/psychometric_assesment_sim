import { prisma } from "@/lib/db";
import { QualityStatus, ImagePosition } from "@prisma/client";
import { validateQuestionForActivation } from "./questionValidator";

export interface CreateQuestionInput {
  id?: string;
  domain: string;
  subtopic: string;
  questionType: any;
  difficulty?: any;
  qualityStatus?: QualityStatus;
  prompt: string;
  svgData?: string | null;
  image?: string | null;
  imagePosition?: ImagePosition;
  options: any[];
  correctAnswer: string;
  rule?: string | null;
  explanation?: string;
  solvingStrategy?: string;
  tags?: string[];
}

export interface UpdateQuestionInput {
  active?: boolean;
  qualityStatus?: QualityStatus;
  prompt?: string;
  options?: any[];
  correctAnswer?: string;
  rule?: string | null;
  explanation?: string;
  solvingStrategy?: string;
  image?: string | null;
  imagePosition?: ImagePosition;
  svgData?: string | null;
}

/**
 * Dependency Inversion & Single Responsibility:
 * Centralized service managing administrative question bank operations, stats, versioning, and cleanup.
 */
export class QuestionAdminService {
  async getQuestionDetails(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { version: "desc" } },
        reports: { orderBy: { createdAt: "desc" }, take: 5 },
        images: true,
      },
    });
  }

  async listQuestionsWithStats(domain?: string | null, qualityStatus?: string | null) {
    const questions = await prisma.question.findMany({
      where: {
        ...(domain && domain !== "ALL" ? { domain } : {}),
        ...(qualityStatus && qualityStatus !== "ALL"
          ? { qualityStatus: qualityStatus as QualityStatus }
          : {}),
      },
      orderBy: { id: "asc" },
      include: {
        images: true,
        _count: {
          select: {
            reports: true,
            versions: true,
          },
        },
      },
    });

    // Compute basic item stats
    const questionIds = questions.map((q) => q.id);
    const attempts = await prisma.questionAttempt.findMany({
      where: { questionId: { in: questionIds } },
      select: {
        questionId: true,
        isCorrect: true,
        isAnswered: true,
        responseTimeMs: true,
        isTimedOut: true,
      },
    });

    const statsMap = new Map<
      string,
      { attemptsCount: number; correctCount: number; avgTimeMs: number; timeoutCount: number }
    >();

    for (const att of attempts) {
      const cur = statsMap.get(att.questionId) || {
        attemptsCount: 0,
        correctCount: 0,
        avgTimeMs: 0,
        timeoutCount: 0,
      };
      cur.attemptsCount += 1;
      if (att.isCorrect) cur.correctCount += 1;
      if (att.isTimedOut) cur.timeoutCount += 1;
      cur.avgTimeMs += att.responseTimeMs;
      statsMap.set(att.questionId, cur);
    }

    return questions.map((q) => {
      const s = statsMap.get(q.id) || {
        attemptsCount: 0,
        correctCount: 0,
        avgTimeMs: 0,
        timeoutCount: 0,
      };
      const accuracy = s.attemptsCount > 0 ? (s.correctCount / s.attemptsCount) * 100 : 0;
      const meanTime = s.attemptsCount > 0 ? s.avgTimeMs / s.attemptsCount : 0;
      const timeoutRate = s.attemptsCount > 0 ? (s.timeoutCount / s.attemptsCount) * 100 : 0;

      return {
        ...q,
        stats: {
          attempts: s.attemptsCount,
          accuracy: Number(accuracy.toFixed(1)),
          avgResponseTimeSec: Number((meanTime / 1000).toFixed(1)),
          timeoutRate: Number(timeoutRate.toFixed(1)),
        },
      };
    });
  }

  async createQuestion(input: CreateQuestionInput, adminEmail?: string, adminUserId?: string) {
    const {
      id,
      domain,
      subtopic,
      questionType,
      difficulty = "MODERATE",
      qualityStatus = QualityStatus.ACTIVE,
      prompt,
      svgData,
      image,
      imagePosition = ImagePosition.ABOVE_QUESTION,
      options,
      correctAnswer,
      rule,
      explanation = "",
      solvingStrategy = "",
      tags = [],
    } = input;

    if (qualityStatus === QualityStatus.ACTIVE) {
      const errors = validateQuestionForActivation({
        prompt,
        options,
        correctAnswer,
        explanation,
      });
      if (errors.length > 0) {
        throw new Error(`Validasi butir soal gagal sebelum diaktifkan: ${errors.join(" ")}`);
      }
    }

    const questionId = id || `Q_${domain.substring(0, 3)}_${Date.now().toString(36).toUpperCase()}`;

    const newQuestion = await prisma.question.create({
      data: {
        id: questionId,
        domain,
        subtopic,
        questionType,
        difficulty,
        qualityStatus,
        prompt,
        svgData: svgData || null,
        image: image || null,
        imagePosition,
        options,
        correctAnswer,
        rule: rule || null,
        explanation,
        solvingStrategy,
        tags,
        active: qualityStatus === QualityStatus.ACTIVE,
        version: 1,
        lastReviewedAt: new Date(),
        lastReviewedBy: adminEmail || "admin",
      },
    });

    await prisma.questionVersion.upsert({
      where: {
        questionId_version: {
          questionId: newQuestion.id,
          version: 1,
        },
      },
      update: {
        questionData: {
          prompt: newQuestion.prompt,
          image: newQuestion.image,
          imagePosition: newQuestion.imagePosition,
          svgData: newQuestion.svgData,
          options: newQuestion.options,
          correctAnswer: newQuestion.correctAnswer,
          rule: (newQuestion as any).rule,
          explanation: newQuestion.explanation,
          solvingStrategy: newQuestion.solvingStrategy,
          qualityStatus: newQuestion.qualityStatus,
        },
        changedBy: adminUserId || null,
        changeReason: "Pembuatan butir soal awal",
      },
      create: {
        questionId: newQuestion.id,
        version: 1,
        questionData: {
          prompt: newQuestion.prompt,
          image: newQuestion.image,
          imagePosition: newQuestion.imagePosition,
          svgData: newQuestion.svgData,
          options: newQuestion.options,
          correctAnswer: newQuestion.correctAnswer,
          rule: (newQuestion as any).rule,
          explanation: newQuestion.explanation,
          solvingStrategy: newQuestion.solvingStrategy,
          qualityStatus: newQuestion.qualityStatus,
        },
        changedBy: adminUserId || null,
        changeReason: "Pembuatan butir soal awal",
      },
    });

    return newQuestion;
  }

  async updateQuestionWithSnapshot(
    id: string,
    input: UpdateQuestionInput,
    changeReason?: string,
    adminEmail?: string,
    adminUserId?: string
  ) {
    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Butir soal tidak ditemukan.");
    }

    const mergedPrompt = input.prompt !== undefined ? input.prompt : existing.prompt;
    const mergedOptions = input.options !== undefined ? input.options : (existing.options as any[]);
    const mergedCorrect = input.correctAnswer !== undefined ? input.correctAnswer : existing.correctAnswer;
    const mergedExp = input.explanation !== undefined ? input.explanation : existing.explanation;
    const targetQualityStatus = input.qualityStatus || existing.qualityStatus;

    if (
      targetQualityStatus === QualityStatus.ACTIVE ||
      (input.active === true && existing.qualityStatus === QualityStatus.ACTIVE)
    ) {
      const errors = validateQuestionForActivation({
        prompt: mergedPrompt,
        options: mergedOptions,
        correctAnswer: mergedCorrect,
        explanation: mergedExp,
      });
      if (errors.length > 0) {
        throw new Error(`Validasi gagal untuk status ACTIVE: ${errors.join(" ")}`);
      }
    }

    // Ensure prior version snapshot exists
    await prisma.questionVersion.upsert({
      where: {
        questionId_version: {
          questionId: existing.id,
          version: existing.version,
        },
      },
      update: {},
      create: {
        questionId: existing.id,
        version: existing.version,
        questionData: {
          prompt: existing.prompt,
          image: existing.image,
          imagePosition: existing.imagePosition,
          svgData: existing.svgData,
          options: existing.options,
          correctAnswer: existing.correctAnswer,
          rule: (existing as any).rule,
          explanation: existing.explanation,
          solvingStrategy: existing.solvingStrategy,
          qualityStatus: existing.qualityStatus,
        },
        changedBy: adminUserId || null,
        changeReason: "Snapshot versi sebelum pembaruan",
      },
    });

    const nextVersion = existing.version + 1;

    const updated = await prisma.question.update({
      where: { id },
      data: {
        active: input.active !== undefined ? input.active : targetQualityStatus === QualityStatus.ACTIVE,
        qualityStatus: targetQualityStatus as QualityStatus,
        prompt: input.prompt !== undefined ? input.prompt : undefined,
        options: input.options !== undefined ? input.options : undefined,
        correctAnswer: input.correctAnswer !== undefined ? input.correctAnswer : undefined,
        rule: input.rule !== undefined ? input.rule : undefined,
        explanation: input.explanation !== undefined ? input.explanation : undefined,
        solvingStrategy: input.solvingStrategy !== undefined ? input.solvingStrategy : undefined,
        image: input.image !== undefined ? input.image : undefined,
        imagePosition: input.imagePosition !== undefined ? input.imagePosition : undefined,
        svgData: input.svgData !== undefined ? input.svgData : undefined,
        version: nextVersion,
        lastReviewedAt: new Date(),
        lastReviewedBy: adminEmail || "admin",
      },
    });

    await prisma.questionVersion.upsert({
      where: {
        questionId_version: {
          questionId: updated.id,
          version: nextVersion,
        },
      },
      update: {
        questionData: {
          prompt: updated.prompt,
          image: updated.image,
          imagePosition: updated.imagePosition,
          svgData: updated.svgData,
          options: updated.options,
          correctAnswer: updated.correctAnswer,
          rule: (updated as any).rule,
          explanation: updated.explanation,
          solvingStrategy: updated.solvingStrategy,
          qualityStatus: updated.qualityStatus,
        },
        changedBy: adminUserId || null,
        changeReason: changeReason || "Pembaruan oleh administrator",
      },
      create: {
        questionId: updated.id,
        version: nextVersion,
        questionData: {
          prompt: updated.prompt,
          image: updated.image,
          imagePosition: updated.imagePosition,
          svgData: updated.svgData,
          options: updated.options,
          correctAnswer: updated.correctAnswer,
          rule: (updated as any).rule,
          explanation: updated.explanation,
          solvingStrategy: updated.solvingStrategy,
          qualityStatus: updated.qualityStatus,
        },
        changedBy: adminUserId || null,
        changeReason: changeReason || "Pembaruan oleh administrator",
      },
    });

    return updated;
  }

  async deleteQuestionCascade(id: string) {
    const targetQuestion = await prisma.question.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!targetQuestion) {
      throw new Error("Butir soal tidak ditemukan.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.questionAttempt.deleteMany({
        where: { questionId: id },
      });
      await tx.questionReport.deleteMany({
        where: { questionId: id },
      });
      await tx.questionVersion.deleteMany({
        where: { questionId: id },
      });
      await tx.questionImage.deleteMany({
        where: { questionId: id },
      });
      await tx.question.delete({
        where: { id },
      });
    });

    return true;
  }
}

export const questionAdminService = new QuestionAdminService();
