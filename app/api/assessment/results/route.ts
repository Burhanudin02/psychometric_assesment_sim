import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateSessionMetrics } from "@/features/scoring/calculator";
import { generateTrainingRecommendations } from "@/features/review/trainingAdvisor";
import { getAllQuestions } from "@/features/questions/repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "sessionId required" }, { status: 400 });
    }

    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        modules: { orderBy: { moduleNumber: "asc" } },
        result: true,
        domainResults: true,
        attempts: {
          include: { question: true, module: true },
          orderBy: { submittedAt: "asc" },
        },
        integrityEvents: true,
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    const attemptsInput = session.attempts.map((a) => ({
      questionId: a.questionId,
      moduleId: a.moduleId,
      moduleNumber: a.module.moduleNumber,
      domain: a.module.domain,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.question?.correctAnswer || "",
      isCorrect: a.isCorrect,
      isAnswered: a.isAnswered,
      responseTimeMs: a.responseTimeMs,
      isTimedOut: a.isTimedOut,
    }));

    const timeoutCount = session.modules.filter((m) => m.isTimedOut).length;
    const metrics = calculateSessionMetrics(attemptsInput, timeoutCount);
    const recommendations = generateTrainingRecommendations(metrics);

    // Compute error counts for taxonomy
    const errorCountMap = new Map<string, number>();
    for (const att of session.attempts) {
      if (!att.isCorrect) {
        const cat = att.errorCategory || "DISTRACTOR_SELECTION";
        errorCountMap.set(cat, (errorCountMap.get(cat) || 0) + 1);
      }
    }

    const errorTaxonomy = Array.from(errorCountMap.entries()).map(([category, count]) => {
      let label = "Kekeliruan Pengecoh";
      let desc = "Memilih opsi pengalih.";
      let tip = "Lakukan eliminasi opsi ekstrem terlebih dahulu.";

      if (category === "TIMEOUT_UNANSWERED") {
        label = "Kehabisan Waktu Modul";
        desc = "Waktu 60 detik modul habis sebelum soal sempat dijawab.";
        tip = "Tingkatkan laju pengerjaan; jangan terpaku pada satu soal lebih dari 10 detik.";
      } else if (category === "CARELESS_RAPID_ERROR") {
        label = "Menjawab Terburu-buru (< 1.5s)";
        desc = "Terjadi kesalahan karena mengklik terlalu cepat tanpa verifikasi.";
        tip = "Luangkan minimal 2 detik untuk membaca seluruh pilihan sebelum menjawab.";
      } else if (category === "ARITHMETIC_ERROR") {
        label = "Kekeliruan Perhitungan Aritmatika";
        desc = "Salah menghitung operasi matematika dasar atau persentase.";
        tip = "Cek digit satuan hasil perhitungan untuk mengonfirmasi jawaban.";
      } else if (category === "PATTERN_MISRECOGNITION") {
        label = "Keliru Menentukan Pola Deret/Figural";
        desc = "Aturan perubahan barisan angka atau figur visual disimpulkan keliru.";
        tip = "Periksa selisih tingkat dua atau pola berselang.";
      } else if (category === "SPATIAL_ORIENTATION_ERROR") {
        label = "Kekeliruan Rotasi Spasial";
        desc = "Tertukar antara orientasi rotasi kaku dengan cerminan bidang.";
        tip = "Gunakan sisi yang bersebelahan sebagai jangkar orientasi.";
      }

      return {
        category,
        label,
        count,
        description: desc,
        remedyTip: tip,
      };
    });

    // Detailed question review list
    const questionReviewList = session.attempts.map((att) => ({
      attemptId: att.id,
      questionId: att.questionId,
      moduleNumber: att.module.moduleNumber,
      moduleTitle: att.module.title,
      domain: att.module.domain,
      prompt: att.question.prompt,
      svgData: att.question.svgData,
      options: att.question.options,
      selectedAnswer: att.selectedAnswer,
      correctAnswer: att.question.correctAnswer,
      isCorrect: att.isCorrect,
      isAnswered: att.isAnswered,
      isTimedOut: att.isTimedOut,
      responseTimeMs: att.responseTimeMs,
      errorCategory: att.errorCategory,
      explanation: att.question.explanation,
      solvingStrategy: att.question.solvingStrategy,
    }));

    return NextResponse.json({
      success: true,
      session,
      metrics,
      recommendations,
      errorTaxonomy,
      questionReviewList,
      integrityEvents: session.integrityEvents,
    });
  } catch (err: any) {
    console.error("Error retrieving assessment results:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
