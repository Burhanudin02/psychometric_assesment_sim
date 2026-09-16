"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  KeyRound,
  Mail,
  ArrowRight,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("from") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam === "admin_required"
      ? "Halaman ini memerlukan hak akses Administrator. Silakan masuk sebagai Admin."
      : null
  );

  const handleLogin = async (e?: React.FormEvent, customPayload?: any) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const payload = customPayload || { email, password };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal masuk. Periksa kembali data Anda.");
      }

      // Successful login
      if (data.user?.role === "ADMIN" && fromUrl.startsWith("/admin")) {
        router.push(fromUrl);
      } else if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push(fromUrl === "/admin" ? "/dashboard" : fromUrl);
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: "ADMIN" | "USER") => {
    handleLogin(undefined, { demoRole: role });
  };

  const handleGuestLogin = () => {
    handleLogin(undefined, { isGuest: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xs py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <BetaBadge />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 p-6 text-white text-center relative">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
              <Shield className="h-6 w-6 text-blue-200" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Portal Masuk Simulasi</h1>
            <p className="text-xs text-blue-200 mt-1">
              Cognitive Assessment Simulator · Manajemen Akun & Sesi
            </p>
          </div>

          <div className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2 animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm"
              >
                {loading ? "Memproses..." : "Masuk ke Sistem"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 font-bold text-slate-400">
                  Akses Cepat Pengujian / Demo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => handleDemoLogin("ADMIN")}
                className="text-[11px] font-semibold text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-900 flex items-center justify-center py-2"
              >
                <Shield className="h-3.5 w-3.5 mr-1 text-blue-800" />
                <span>Masuk Admin Demo</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => handleDemoLogin("USER")}
                className="text-[11px] font-semibold text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-center py-2"
              >
                <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-700" />
                <span>Masuk User Demo</span>
              </Button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleGuestLogin}
                className="text-xs text-blue-900 font-semibold hover:underline inline-flex items-center"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                <span>Lanjutkan Langsung sebagai Kandidat Tamu (Guest)</span>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 border-t border-slate-100 p-3.5 text-center text-[10px] text-slate-500">
            Kredensial Default Demo: Admin (<code className="font-mono text-slate-700">admin@simulator.local</code> / <code className="font-mono text-slate-700">AdminPass123!</code>)
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400">
        Simulasi Pelatihan Psikometrik · Proyek Edukasi & Rekayasa Terbuka
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Memuat portal login...</div>}>
      <LoginForm />
    </Suspense>
  );
}

