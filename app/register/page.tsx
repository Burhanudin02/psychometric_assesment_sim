"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  KeyRound,
  Mail,
  ArrowRight,
  UserPlus,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("from") || "/dashboard";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal harus 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Pendaftaran gagal. Silakan coba lagi.");
      }

      // Automatically redirected to dashboard upon successful registration
      router.push(fromUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kendala saat mendaftarkan akun.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGuest: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal masuk sebagai tamu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-200 bg-white py-3 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-800 hover:text-blue-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-semibold">Kembali ke Beranda</span>
          </Link>
          <BetaBadge size="sm" />
        </div>
      </header>

      {/* Main Registration Box */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100 text-center bg-radial from-blue-50/50 via-white to-white">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white shadow-xs mb-3">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Daftar Akun Baru</h1>
            <p className="text-xs text-slate-500 mt-1">
              Simulasi Pelatihan Psikometrik Online
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <CheckCircle2 className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm cursor-pointer"
              >
                {loading ? "Mendaftarkan..." : "Daftar Akun Sekarang"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>

            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-white px-2 text-slate-500 font-medium">
                  Sudah memiliki akun?
                </span>
              </div>
            </div>

            <Link href="/login" className="block w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-50 py-2.5 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <span>Masuk ke Akun Terdaftar</span>
              </Button>
            </Link>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleGuestLogin}
                className="text-xs text-blue-900 font-semibold hover:underline inline-flex items-center cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                <span>Lanjutkan sebagai Tamu (Guest) tanpa Akun</span>
              </button>
            </div>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Memuat halaman pendaftaran...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

