import { NextResponse } from "next/server";
import { getCalibrationQuestions, evaluateCalibration } from "@/features/calibration/calibrationService";

export async function GET() {
  try {
    const questions = await getCalibrationQuestions();
    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attempts } = body;

    if (!Array.isArray(attempts)) {
      return NextResponse.json({ success: false, error: "attempts array required" }, { status: 400 });
    }

    const evaluation = evaluateCalibration(attempts);
    return NextResponse.json({ success: true, evaluation });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
