import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { displayName, email, password } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Kata sandi minimal harus terdiri dari 6 karakter." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = displayName?.trim() || cleanEmail.split("@")[0];

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Alamat email ini sudah terdaftar. Silakan masuk." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const anonToken = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        displayName: cleanName,
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        anonymousToken: anonToken,
        lastLoginAt: new Date(),
      },
    });

    const token = createSessionToken({
      userId: newUser.id,
      role: newUser.role,
      email: newUser.email,
      displayName: newUser.displayName,
    });

    const response = NextResponse.json({
      success: true,
      message: "Pendaftaran akun berhasil.",
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
      },
    });

    // Set session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Terjadi kesalahan pada server saat pendaftaran." },
      { status: 500 }
    );
  }
}
