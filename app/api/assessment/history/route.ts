import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sessions = await prisma.assessmentSession.findMany({
      where: {
        status: "COMPLETED",
        mode: "FULL_SIMULATION",
      },
      include: {
        result: true,
        domainResults: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
