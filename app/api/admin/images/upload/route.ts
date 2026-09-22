import { NextResponse } from "next/server";
import { ImageStorageService } from "@/lib/storage";
import { prisma } from "@/lib/db";
import { ImagePosition } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const questionId = formData.get("questionId") as string | null;
    const optionId = formData.get("optionId") as string | null;
    const position = (formData.get("position") as ImagePosition) || ImagePosition.ABOVE_QUESTION;

    if (!file) {
      return NextResponse.json({ success: false, error: "File gambar tidak ditemukan." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await ImageStorageService.saveImage(buffer, file.name, file.type);

    let dbImage = null;
    if (questionId) {
      dbImage = await prisma.questionImage.create({
        data: {
          questionId,
          optionId: optionId || null,
          storagePath: stored.storagePath,
          url: stored.url,
          originalFilename: stored.originalFilename,
          mimeType: stored.mimeType,
          size: stored.size,
          position,
        },
      });
    }

    return NextResponse.json({
      success: true,
      url: stored.url,
      filename: stored.filename,
      size: stored.size,
      mimeType: stored.mimeType,
      imageRecord: dbImage,
    });
  } catch (err: any) {
    console.error("Image upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengunggah gambar." },
      { status: 400 }
    );
  }
}

