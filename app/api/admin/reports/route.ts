import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { QualityStatus, ReportStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const domain = searchParams.get("domain");

    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.status = status as ReportStatus;
    }

    if (domain && domain !== "ALL") {
      whereClause.question = { domain };
    }

    const reports = await prisma.questionReport.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        question: {
          select: {
            id: true,
            domain: true,
            subtopic: true,
            questionType: true,
            qualityStatus: true,
            prompt: true,
            image: true,
            imagePosition: true,
            svgData: true,
            options: true,
            correctAnswer: true,
            explanation: true,
            solvingStrategy: true,
            reportCount: true,
            version: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    const [totalCount, openCount, inReviewCount, resolvedCount] = await Promise.all([
      prisma.questionReport.count(),
      prisma.questionReport.count({ where: { status: ReportStatus.OPEN } }),
      prisma.questionReport.count({ where: { status: ReportStatus.IN_REVIEW } }),
      prisma.questionReport.count({ where: { status: ReportStatus.RESOLVED } }),
    ]);

    const reviewRequiredQuestionsCount = await prisma.question.count({
      where: { qualityStatus: QualityStatus.REVIEW_REQUIRED },
    });

    return NextResponse.json({
      success: true,
      reports,
      summary: {
        total: totalCount,
        open: openCount,
        inReview: inReviewCount,
        resolved: resolvedCount,
        reviewRequiredQuestions: reviewRequiredQuestionsCount,
      },
    });
  } catch (err: any) {
    console.error("Error fetching admin reports:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await getCurrentUser();
    const body = await req.json();
    const { reportId, status, adminNote, updateQuestionStatus } = body;

    if (!reportId) {
      return NextResponse.json({ success: false, error: "ID Laporan diperlukan." }, { status: 400 });
    }

    const report = await prisma.questionReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ success: false, error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.questionReport.update({
      where: { id: reportId },
      data: {
        status: status ? (status as ReportStatus) : undefined,
        adminNote: adminNote !== undefined ? adminNote : undefined,
        reviewedAt: new Date(),
        reviewedBy: adminUser?.email || "admin",
      },
    });

    // Optionally update associated question status
    if (updateQuestionStatus) {
      await prisma.question.update({
        where: { id: report.questionId },
        data: {
          qualityStatus: updateQuestionStatus as QualityStatus,
          lastReviewedAt: new Date(),
          lastReviewedBy: adminUser?.email || "admin",
          reviewNote: adminNote || undefined,
        },
      });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (err: any) {
    console.error("Error updating report:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

