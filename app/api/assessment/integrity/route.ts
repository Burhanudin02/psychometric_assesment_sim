import { NextResponse } from "next/server";
import { logIntegrityEvent } from "@/features/assessment/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, eventType, metadata } = body;

    if (!sessionId || !eventType) {
      return NextResponse.json({ success: false, error: "Missing sessionId or eventType" }, { status: 400 });
    }

    const event = await logIntegrityEvent(sessionId, eventType, metadata);

    return NextResponse.json({ success: true, eventId: event?.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
