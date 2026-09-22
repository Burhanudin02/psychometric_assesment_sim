import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_SECRET = process.env.AUTH_SECRET || "cas-production-fallback-secret-key-2026-secure";
const SESSION_COOKIE_NAME = "cas_session";

async function verifyEdgeToken(token: string): Promise<{ userId: string; role: string; exp: number } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;

    // Convert base64url to Uint8Array
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) {
      return null;
    }

    // Verify HMAC with Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const expectedBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const expectedArray = Array.from(new Uint8Array(expectedBuf));
    const expectedSig = btoa(String.fromCharCode(...expectedArray))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    if (signature !== expectedSig) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    let isValidAdmin = false;
    if (sessionCookie) {
      const payload = await verifyEdgeToken(sessionCookie);
      if (payload && payload.role === "ADMIN") {
        isValidAdmin = true;
      }
    }

    if (!isValidAdmin) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { success: false, error: "Akses ditolak. Diperlukan hak akses Administrator." },
          { status: 403 }
        );
      } else {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        loginUrl.searchParams.set("error", "admin_required");
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

