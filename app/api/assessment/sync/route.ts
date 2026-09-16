import { NextResponse } from "next/server";
import { getActiveSessionState } from "@/features/assessment/engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "sessionId required" }, { status: 400 });
    }

    const state = await getActiveSessionState(sessionId);
    if (!state) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...state,
    });
  } catch (error: any) {
    console.error("Error syncing assessment session:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
