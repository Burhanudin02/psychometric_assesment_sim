"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  PlayCircle,
  BookOpen,
  Activity,
  History,
  Settings,
  Layers,
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";
import { APP_VERSION, RELEASE_TAG } from "@/lib/version";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Corporate Nav */}
      <header className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-900 font-bold text-white tracking-wider text-sm shadow-xs">
              CAS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Cognitive Assessment Simulator
                </span>
                <BetaBadge />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Part 1 Speeded Cognitive Assessment Training
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs text-slate-700">
                <History className="h-4 w-4 mr-1.5" />
                <span>Riwayat</span>
              </Button>
            </Link>

            {currentUser?.role === "ADMIN" ? (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="text-xs border-blue-200 bg-blue-50 text-blue-900 font-semibold">
                  <Shield className="h-3.5 w-3.5 mr-1 text-blue-800" />
                  <span>Panel Admin</span>
                </Button>
              </Link>
            ) : (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <span className="text-xs font-semibold text-slate-800 hidden md:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-rose-600 h-8 px-2"
                  title="Keluar / Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="text-xs bg-blue-900 hover:bg-blue-800 text-white font-semibold">
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                  <span>Masuk</span>
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Important Educational Disclaimer Banner */}
        <div className="rounded-lg border border-amber-300 bg-amber-50/90 p-4 mb-8 shadow-xs text-xs sm:text-sm text-amber-950 flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Disclaimer Independensi & Hak Cipta:
            </p>
            <p className="text-amber-900/90 leading-relaxed">
              Aplikasi ini adalah simulator persiapan edukasi independen dan <strong>BUKAN</strong> merupakan aplikasi resmi dari entitas bisnis, institusi, atau penyelenggara asesmen mana pun. Seluruh soal, visualisasi, dan grafik adalah <strong>100% orisinil</strong> yang direkonstruksi untuk melatih kecepatan berpikir dan adaptasi kognitif di bawah batas waktu ketat.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simulasi Asesmen Kognitif Online
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Latih refleks berpikir cepat, akurasi penalaran, dan ketahanan konsentrasi dalam format <strong>21 subtes berturut-turut (~60 detik per modul)</strong> yang realistis.
          </p>
        </div>

        {/* Primary Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Mode B: Full Simulation Mode */}
          <div className="rounded-xl border-2 border-blue-900 bg-white p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
              Rekomendasi Utama
            </div>
            <div>
              <div className="flex items-center space-x-2.5 text-blue-900 mb-3">
                <PlayCircle className="h-7 w-7" />
                <h2 className="text-xl font-bold tracking-tight">
                  Simulasi Penuh (Full Simulation)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Simulasi terstandar 21 modul non-stop. Uji kecepatan dan konsistensi stamina berpikir di bawah batas waktu ketat ~60 detik per modul.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-800" />
                  <span>Tepat 21 subtes berturut-turut (~1 menit per modul)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-800" />
                  <span>Otomatis berpindah subtes saat waktu habis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-800" />
                  <span>Mode layar penuh (fullscreen) & tanpa jeda</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-800" />
                  <span>Fitur pelaporan soal ambigu dan kualitas visual</span>
                </li>
              </ul>
            </div>
            <Link href="/simulation/prepare">
              <Button size="lg" className="w-full bg-blue-900 hover:bg-blue-800 font-bold shadow-md text-white">
                Mulai Simulasi 21 Modul
              </Button>
            </Link>
          </div>

          {/* Mode A: Practice Drill Mode */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2.5 text-slate-800 mb-3">
                <BookOpen className="h-7 w-7 text-blue-700" />
                <h2 className="text-xl font-bold tracking-tight">
                  Latihan Terarah (Practice Drills)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Pilih domain dan subtopik spesifik untuk memperkuat konsep dasar dengan penjelasan langkah demi langkah dan tips eliminasi cepat.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  <span>8 Domain kognitif (Numerical, Series, Verbal, Spatial, dll.)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  <span>Opsi Mode Belajar tanpa batas waktu atau Speed Drill</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  <span>Pembahasan detail dan strategi pengerjaan langsung</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  <span>Ulangi soal salah untuk drill topik lemah</span>
                </li>
              </ul>
            </div>
            <Link href="/practice">
              <Button variant="outline" size="lg" className="w-full font-bold border-slate-300 hover:bg-slate-50">
                Pilih Modul Latihan
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Pre-Assessment Diagnostic Calibration */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <Activity className="h-6 w-6 text-blue-900 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Uji Diagnostik Cepat (10 Soal Kalibrasi)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Ingin mengetahui kekuatan dan kelemahan domain kognitif Anda dalam 3 menit? Ambil tes kalibrasi singkat ini.
              </p>
            </div>
          </div>
          <Link href="/calibration" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" className="w-full bg-blue-800 hover:bg-blue-700 text-xs font-semibold px-4 text-white">
              Mulai Uji Kalibrasi
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <span>Cognitive Assessment Simulator</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono text-slate-700 font-semibold">{RELEASE_TAG}</span>
          <BetaBadge minimal />
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Platform simulasi edukasi independen · Seluruh butir soal dan materi orisinil
        </p>
      </footer>
    </div>
  );
}
