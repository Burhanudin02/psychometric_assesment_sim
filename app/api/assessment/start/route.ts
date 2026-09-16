import { NextResponse } from "next/server";
import { createAssessmentSession } from "@/features/assessment/engine";
import { getCurrentUser } from "@/lib/auth";
import { SessionMode } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const token = body.anonymousToken || `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const mode = body.mode === "PRACTICE" ? SessionMode.PRACTICE : SessionMode.FULL_SIMULATION;

    const session = await createAssessmentSession(token, mode, user?.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      mode: session.mode,
      currentModuleNum: session.currentModuleNum,
    });
  } catch (error: any) {
    console.error("Error starting assessment session:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
