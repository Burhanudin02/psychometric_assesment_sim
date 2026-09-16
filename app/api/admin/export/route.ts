import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAllQuestions } from "@/features/questions/repository";

export async function GET() {
  try {
    const questions = await getAllQuestions();
    return new NextResponse(JSON.stringify(questions, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="question_bank_export.json"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const items = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Expected JSON array of questions" }, { status: 400 });
    }

    let importedCount = 0;
    for (const q of items) {
      if (!q.id || !q.prompt || !q.correctAnswer) continue;
      await prisma.question.upsert({
        where: { id: q.id },
        update: {
          domain: q.domain,
          subtopic: q.subtopic,
          questionType: q.questionType,
          difficulty: q.difficulty,
          prompt: q.prompt,
          svgData: q.svgData || null,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          solvingStrategy: q.solvingStrategy,
          tags: q.tags || [],
          active: q.active ?? true,
        },
        create: {
          id: q.id,
          domain: q.domain,
          subtopic: q.subtopic,
          questionType: q.questionType,
          difficulty: q.difficulty,
          prompt: q.prompt,
          svgData: q.svgData || null,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          solvingStrategy: q.solvingStrategy,
          tags: q.tags || [],
          active: q.active ?? true,
        },
      });
      importedCount++;
    }

    return NextResponse.json({ success: true, importedCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
