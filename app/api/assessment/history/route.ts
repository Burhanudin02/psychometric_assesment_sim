import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const whereClause: any = {
      status: "COMPLETED",
      mode: "FULL_SIMULATION",
    };

    if (user && user.role !== "ADMIN") {
      whereClause.userId = user.id;
    }

    const sessions = await prisma.assessmentSession.findMany({
      where: whereClause,
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
