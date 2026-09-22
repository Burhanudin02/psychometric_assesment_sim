import { NextResponse } from "next/server";
import { terminateAssessmentSession } from "@/features/assessment/services/assessmentIntegrityService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, moduleNumber, answers, reason, details } = body;

    const { statusCode, response } = await terminateAssessmentSession({
      sessionId,
      moduleNumber,
      answers,
      reason,
      details,
    });

    return NextResponse.json(response, { status: statusCode });
  } catch (err: any) {
    console.error("Error handling assessment termination:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
