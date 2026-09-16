import { NextResponse } from "next/server";
import { getQuestionsByFilter } from "@/features/questions/repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const limit = searchParams.get("count") ? Number(searchParams.get("count")) : 10;

    const questions = await getQuestionsByFilter({
      domain,
      difficulty,
      limit,
    });

    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
