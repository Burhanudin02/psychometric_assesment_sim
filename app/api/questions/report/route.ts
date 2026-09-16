import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { QualityStatus, ReportReason, ReportStatus, UserRole, UserStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, questionVersion = 1, reason, comment, sessionId, anonymousToken } = body;

    if (!questionId || !reason) {
      return NextResponse.json(
        { success: false, error: "ID Soal dan Alasan Pelaporan wajib diisi." },
        { status: 400 }
      );
    }

    // Resolve user: either authenticated user or anonymous user
    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      if (anonymousToken) {
        let anonUser = await prisma.user.findUnique({ where: { anonymousToken } });
        if (!anonUser) {
          anonUser = await prisma.user.create({
            data: {
              anonymousToken,
              displayName: "Kandidat Tamu",
              role: UserRole.USER,
              status: UserStatus.ACTIVE,
            },
          });
        }
        userId = anonUser.id;
      } else if (sessionId) {
        const session = await prisma.assessmentSession.findUnique({
          where: { id: sessionId },
          select: { userId: true },
        });
        if (session) {
          userId = session.userId;
        }
      }
    }

    if (!userId) {
      // Fallback: create temporary reporter user
      const tempToken = `reporter_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const anon = await prisma.user.create({
        data: {
          anonymousToken: tempToken,
          displayName: "Kandidat Pelapor",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
        },
      });
      userId = anon.id;
    }

    // Duplicate report prevention: Check if this user already reported this question in this session or recently
    const existingReport = await prisma.questionReport.findFirst({
      where: {
        questionId,
        userId,
        ...(sessionId ? { sessionId } : {}),
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          success: false,
          error: "Anda telah mengirimkan laporan untuk butir soal ini sebelumnya.",
          isDuplicate: true,
        },
        { status: 409 }
      );
    }

    // Create the report
    const report = await prisma.questionReport.create({
      data: {
        questionId,
        questionVersion: Number(questionVersion) || 1,
        userId,
        sessionId: sessionId || null,
        reason: reason as ReportReason,
        comment: comment ? String(comment).trim() : null,
        status: ReportStatus.OPEN,
      },
    });

    // Increment question's reportCount
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        reportCount: { increment: 1 },
      },
    });

    // Auto-flagging logic: If question receives >= 3 distinct reports, transition qualityStatus to REVIEW_REQUIRED
    let autoFlagged = false;
    const totalReports = await prisma.questionReport.count({
      where: { questionId },
    });

    if (totalReports >= 3 && updatedQuestion.qualityStatus !== QualityStatus.REVIEW_REQUIRED) {
      await prisma.question.update({
        where: { id: questionId },
        data: {
          qualityStatus: QualityStatus.REVIEW_REQUIRED,
        },
      });
      autoFlagged = true;
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      totalReports,
      autoFlagged,
      message: "Laporan berhasil dicatat. Terima kasih atas kontribusi Anda meningkatkan kualitas soal.",
    });
  } catch (err: any) {
    console.error("Error submitting question report:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mencatat laporan soal." },
      { status: 500 }
    );
  }
}

