import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      success: true,
      user: user
        ? {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            status: user.status,
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, user: null });
  }
}
