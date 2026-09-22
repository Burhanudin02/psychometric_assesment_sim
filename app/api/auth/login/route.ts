import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  bootstrapAdminUser,
} from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Ensure admin user is bootstrapped
    await bootstrapAdminUser();

    const body = await req.json();
    const { email, password, demoRole, isGuest } = body;

    let user;

    if (isGuest) {
      // Create or return guest user
      const anonToken = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      user = await prisma.user.create({
        data: {
          anonymousToken: anonToken,
          displayName: "Tamu / Guest Candidate",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
        },
      });
    } else if (demoRole === "ADMIN") {
      user = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
      });
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Akun demo Admin belum siap. Silakan coba lagi." },
          { status: 400 }
        );
      }
    } else if (demoRole === "USER") {
      user = await prisma.user.findFirst({
        where: { email: "user@simulator.local" },
      });
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Akun demo Pengguna belum siap. Silakan coba lagi." },
          { status: 400 }
        );
      }
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: "Email dan kata sandi wajib diisi." },
          { status: 400 }
        );
      }

      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { success: false, error: "Email atau kata sandi tidak valid." },
          { status: 401 }
        );
      }

      if (user.status === UserStatus.DISABLED) {
        return NextResponse.json(
          { success: false, error: "Akun Anda telah dinonaktifkan oleh administrator." },
          { status: 403 }
        );
      }

      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Email atau kata sandi tidak valid." },
          { status: 401 }
        );
      }
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = createSessionToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      displayName: user.displayName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}

