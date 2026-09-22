import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, getCurrentUser } from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            sessions: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Pengguna dengan email ini sudah terdaftar." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const userRole = role === "ADMIN" ? UserRole.ADMIN : UserRole.USER;

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        displayName: displayName || email.split("@")[0],
        passwordHash,
        role: userRole,
        status: UserStatus.ACTIVE,
        anonymousToken: `created_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, role, status, newPassword } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID pengguna diperlukan." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Safety guard: Protect last active administrator
    if (
      (role && role !== targetUser.role && role === UserRole.USER) ||
      (status && status !== targetUser.status && status === UserStatus.DISABLED)
    ) {
      if (targetUser.role === UserRole.ADMIN && targetUser.status === UserStatus.ACTIVE) {
        const activeAdminCount = await prisma.user.count({
          where: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
        });
        if (activeAdminCount <= 1) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Operasi ditolak: Tidak dapat menonaktifkan atau menurunkan hak akses Administrator aktif terakhir dalam sistem.",
            },
            { status: 400 }
          );
        }
      }
    }

    const updateData: any = {};
    if (role && (role === UserRole.ADMIN || role === UserRole.USER)) {
      updateData.role = role;
    }
    if (status && (status === UserStatus.ACTIVE || status === UserStatus.DISABLED)) {
      updateData.status = status;
    }
    if (newPassword && newPassword.trim().length >= 6) {
      updateData.passwordHash = hashPassword(newPassword.trim());
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Tindakan ini memerlukan hak akses Administrator." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // body was not JSON or empty
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID pengguna yang ingin dihapus wajib disertakan." },
        { status: 400 }
      );
    }

    // Safety check 1: Prevent deleting self
    if (adminUser.id === id) {
      return NextResponse.json(
        { success: false, error: "Operasi ditolak: Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Safety check 2: Prevent deleting the last active Administrator
    if (targetUser.role === UserRole.ADMIN && targetUser.status === UserStatus.ACTIVE) {
      const activeAdminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Operasi ditolak: Tidak dapat menghapus Administrator aktif terakhir dalam sistem.",
          },
          { status: 400 }
        );
      }
    }

    // Perform deletion (cascades sessions and reports)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Akun pengguna ${targetUser.displayName || targetUser.email || targetUser.id} berhasil dihapus permanen.`,
    });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Terjadi kesalahan saat menghapus pengguna." },
      { status: 500 }
    );
  }
}


