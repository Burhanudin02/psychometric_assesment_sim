import { NextResponse } from "next/server";
import { submitModuleAnswersInternal } from "@/features/assessment/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, moduleNumber, answers, isTimedOut } = body;

    if (!sessionId || typeof moduleNumber !== "number") {
      return NextResponse.json(
        { success: false, error: "sessionId and numeric moduleNumber required" },
        { status: 400 }
      );
    }

    const result = await submitModuleAnswersInternal({
      sessionId,
      moduleNumber,
      answers: Array.isArray(answers) ? answers : [],
      isTimedOut: Boolean(isTimedOut),
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error submitting module answers:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
