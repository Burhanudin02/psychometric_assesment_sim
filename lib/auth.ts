import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";

const AUTH_SECRET = process.env.AUTH_SECRET || "cas-production-fallback-secret-key-2026-secure";
export const SESSION_COOKIE_NAME = "cas_session";
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionPayload {
  userId: string;
  role: UserRole;
  email?: string | null;
  displayName?: string | null;
  exp: number;
}

/**
 * Hash password using scrypt with random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify password against stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, "hex");
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

/**
 * Sign session payload to create tamper-proof token
 */
export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_EXPIRY_MS,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verify session token and return payload if valid and not expired
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(data)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Get current session user from Next.js cookies (server-side)
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        lastLoginAt: true,
      },
    });

    if (!user || user.status === UserStatus.DISABLED) {
      return null;
    }

    return user;
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
}

/**
 * Bootstrap initial Admin and Demo Candidate if database has none
 */
export async function bootstrapAdminUser() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@simulator.local";
      const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123!";
      const passwordHash = hashPassword(adminPassword);

      await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          passwordHash,
        },
        create: {
          email: adminEmail,
          passwordHash,
          displayName: "System Administrator",
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          anonymousToken: `bootstrap_admin_${Date.now()}`,
        },
      });
      console.log(`[Auth Bootstrap] Initial Admin user created: ${adminEmail}`);
    }

    // Also ensure demo user exists
    const demoEmail = "user@simulator.local";
    const demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
    if (!demoUser) {
      const demoHash = hashPassword("UserPass123!");
      await prisma.user.create({
        data: {
          email: demoEmail,
          passwordHash: demoHash,
          displayName: "Demo Candidate",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          anonymousToken: `bootstrap_user_${Date.now()}`,
        },
      });
      console.log(`[Auth Bootstrap] Demo Candidate created: ${demoEmail}`);
    }
  } catch (err) {
    console.warn("[Auth Bootstrap] Warning during bootstrapAdminUser:", err);
  }
}
