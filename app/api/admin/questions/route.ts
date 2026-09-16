import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAllQuestions } from "@/features/questions/repository";
import { getCurrentUser } from "@/lib/auth";
import { QualityStatus, ImagePosition } from "@prisma/client";

function validateQuestionForActivation(data: {
  prompt?: string;
  options?: any[];
  correctAnswer?: string;
  explanation?: string;
}) {
  const errors: string[] = [];
  if (!data.prompt || data.prompt.trim().length === 0) {
    errors.push("Teks soal (prompt) tidak boleh kosong.");
  }
  if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
    errors.push("Soal harus memiliki minimal 2 opsi jawaban.");
  } else {
    const optionIds = data.options.map((o) => o.id);
    if (!data.correctAnswer || !optionIds.includes(data.correctAnswer)) {
      errors.push(
        `Kunci jawaban ('${data.correctAnswer}') harus cocok dengan salah satu opsi (${optionIds.join(", ")}).`
      );
    }
  }
  if (!data.explanation || data.explanation.trim().length === 0) {
    errors.push("Penjelasan solusi (explanation) wajib diisi untuk transparansi kunci jawaban.");
  }
  return errors;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const qualityStatus = searchParams.get("qualityStatus");
    const id = searchParams.get("id");

    if (id) {
      const q = await prisma.question.findUnique({
        where: { id },
        include: {
          versions: { orderBy: { version: "desc" } },
          reports: { orderBy: { createdAt: "desc" }, take: 5 },
          images: true,
        },
      });
      return NextResponse.json({ success: true, question: q });
    }

    let questions = await prisma.question.findMany({
      where: {
        ...(domain && domain !== "ALL" ? { domain } : {}),
        ...(qualityStatus && qualityStatus !== "ALL" ? { qualityStatus: qualityStatus as QualityStatus } : {}),
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

    const enriched = questions.map((q) => {
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

    return NextResponse.json({ success: true, questions: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminUser = await getCurrentUser();
    const body = await req.json();
    const {
      id,
      domain,
      subtopic,
      questionType,
      difficulty,
      qualityStatus = QualityStatus.ACTIVE,
      prompt,
      svgData,
      image,
      imagePosition = ImagePosition.ABOVE_QUESTION,
      options,
      correctAnswer,
      explanation,
      solvingStrategy,
      tags,
    } = body;

    // Validate if setting to ACTIVE
    if (qualityStatus === QualityStatus.ACTIVE) {
      const errors = validateQuestionForActivation({
        prompt,
        options,
        correctAnswer,
        explanation,
      });
      if (errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Validasi butir soal gagal sebelum diaktifkan: ${errors.join(" ")}`,
          },
          { status: 400 }
        );
      }
    }

    const newQuestion = await prisma.question.create({
      data: {
        id: id || `Q_${domain.substring(0, 3)}_${Date.now().toString(36).toUpperCase()}`,
        domain,
        subtopic,
        questionType,
        difficulty: difficulty || "MODERATE",
        qualityStatus: qualityStatus as QualityStatus,
        prompt,
        svgData: svgData || null,
        image: image || null,
        imagePosition: imagePosition as ImagePosition,
        options,
        correctAnswer,
        explanation: explanation || "",
        solvingStrategy: solvingStrategy || "",
        tags: tags || [],
        active: qualityStatus === QualityStatus.ACTIVE,
        version: 1,
        lastReviewedAt: new Date(),
        lastReviewedBy: adminUser?.email || "admin",
      },
    });

    // Create initial snapshot version
    await prisma.questionVersion.create({
      data: {
        questionId: newQuestion.id,
        version: 1,
        questionData: {
          prompt: newQuestion.prompt,
          image: newQuestion.image,
          imagePosition: newQuestion.imagePosition,
          svgData: newQuestion.svgData,
          options: newQuestion.options,
          correctAnswer: newQuestion.correctAnswer,
          explanation: newQuestion.explanation,
          solvingStrategy: newQuestion.solvingStrategy,
          qualityStatus: newQuestion.qualityStatus,
        },
        changedBy: adminUser?.id || null,
        changeReason: "Pembuatan butir soal awal",
      },
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await getCurrentUser();
    const body = await req.json();
    const {
      id,
      active,
      qualityStatus,
      prompt,
      options,
      correctAnswer,
      explanation,
      solvingStrategy,
      image,
      imagePosition,
      svgData,
      changeReason,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID butir soal diperlukan." }, { status: 400 });
    }

    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Butir soal tidak ditemukan." }, { status: 404 });
    }

    const mergedPrompt = prompt !== undefined ? prompt : existing.prompt;
    const mergedOptions = options !== undefined ? options : (existing.options as any[]);
    const mergedCorrect = correctAnswer !== undefined ? correctAnswer : existing.correctAnswer;
    const mergedExp = explanation !== undefined ? explanation : existing.explanation;
    const targetQualityStatus = qualityStatus || existing.qualityStatus;

    // Validate if setting to ACTIVE
    if (targetQualityStatus === QualityStatus.ACTIVE || (active === true && existing.qualityStatus === QualityStatus.ACTIVE)) {
      const errors = validateQuestionForActivation({
        prompt: mergedPrompt,
        options: mergedOptions,
        correctAnswer: mergedCorrect,
        explanation: mergedExp,
      });
      if (errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Validasi gagal untuk status ACTIVE: ${errors.join(" ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Create snapshot of prior version in QuestionVersion
    await prisma.questionVersion.create({
      data: {
        questionId: existing.id,
        version: existing.version,
        questionData: {
          prompt: existing.prompt,
          image: existing.image,
          imagePosition: existing.imagePosition,
          svgData: existing.svgData,
          options: existing.options,
          correctAnswer: existing.correctAnswer,
          explanation: existing.explanation,
          solvingStrategy: existing.solvingStrategy,
          qualityStatus: existing.qualityStatus,
        },
        changedBy: adminUser?.id || null,
        changeReason: changeReason || "Pembaruan oleh administrator",
      },
    });

    // Update with incremented version
    const updated = await prisma.question.update({
      where: { id },
      data: {
        active: active !== undefined ? active : (targetQualityStatus === QualityStatus.ACTIVE),
        qualityStatus: targetQualityStatus as QualityStatus,
        prompt: prompt !== undefined ? prompt : undefined,
        options: options !== undefined ? options : undefined,
        correctAnswer: correctAnswer !== undefined ? correctAnswer : undefined,
        explanation: explanation !== undefined ? explanation : undefined,
        solvingStrategy: solvingStrategy !== undefined ? solvingStrategy : undefined,
        image: image !== undefined ? image : undefined,
        imagePosition: imagePosition !== undefined ? (imagePosition as ImagePosition) : undefined,
        svgData: svgData !== undefined ? svgData : undefined,
        version: existing.version + 1,
        lastReviewedAt: new Date(),
        lastReviewedBy: adminUser?.email || "admin",
      },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
