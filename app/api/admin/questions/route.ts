import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { questionAdminService } from "@/features/questions/services/questionAdminService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const qualityStatus = searchParams.get("qualityStatus");
    const id = searchParams.get("id");

    if (id) {
      const q = await questionAdminService.getQuestionDetails(id);
      return NextResponse.json({ success: true, question: q });
    }

    const questions = await questionAdminService.listQuestionsWithStats(domain, qualityStatus);
    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminUser = await getCurrentUser();
    const body = await req.json();

    const newQuestion = await questionAdminService.createQuestion(
      body,
      adminUser?.email || undefined,
      adminUser?.id || undefined
    );

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await getCurrentUser();
    const body = await req.json();
    const { id, changeReason, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID butir soal diperlukan." }, { status: 400 });
    }

    const updated = await questionAdminService.updateQuestionWithSnapshot(
      id,
      updates,
      changeReason,
      adminUser?.email || undefined,
      adminUser?.id || undefined
    );

    return NextResponse.json({ success: true, question: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Tindakan ini memerlukan hak akses Administrator." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // body wasn't JSON
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID butir soal yang ingin dihapus wajib disertakan." },
        { status: 400 }
      );
    }

    await questionAdminService.deleteQuestionCascade(id);

    return NextResponse.json({
      success: true,
      message: `Butir soal ${id} berhasil dihapus permanen dari bank soal.`,
    });
  } catch (err: any) {
    console.error("Delete question error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Terjadi kesalahan saat menghapus butir soal." },
      { status: 500 }
    );
  }
}
