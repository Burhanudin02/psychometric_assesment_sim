import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAllQuestions } from "@/features/questions/repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    let questions = await getAllQuestions();
    if (domain && domain !== "ALL") {
      questions = questions.filter((q) => q.domain === domain);
    }

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
    const body = await req.json();
    const {
      id,
      domain,
      subtopic,
      questionType,
      difficulty,
      prompt,
      svgData,
      options,
      correctAnswer,
      explanation,
      solvingStrategy,
      tags,
    } = body;

    const newQuestion = await prisma.question.create({
      data: {
        id: id || `CUST_${Date.now()}`,
        domain,
        subtopic,
        questionType,
        difficulty: difficulty || "MODERATE",
        prompt,
        svgData: svgData || null,
        options,
        correctAnswer,
        explanation,
        solvingStrategy,
        tags: tags || [],
        active: true,
      },
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, active, prompt, options, correctAnswer, explanation, solvingStrategy } = body;

    const updated = await prisma.question.update({
      where: { id },
      data: {
        active: active !== undefined ? active : undefined,
        prompt: prompt || undefined,
        options: options || undefined,
        correctAnswer: correctAnswer || undefined,
        explanation: explanation || undefined,
        solvingStrategy: solvingStrategy || undefined,
      },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
