"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertOctagon,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const REASON_DESCRIPTIONS: Record<string, { label: string; desc: string }> = {
  ESC_PRESSED: {
    label: "Tombol Esc (Escape) Ditekan",
    desc: "Tombol Escape ditekan selama simulasi penuh aktif. Sistem langsung menghentikan sesi sesuai protokol integritas waktu nyata.",
  },
  ALT_PRESSED: {
    label: "Tombol Alt Ditekan",
    desc: "Tombol Alt terdeteksi ditekan selama simulasi. Sesuai protokol pengawasan asesmen, sesi segera ditutup.",
  },
  FULLSCREEN_EXITED: {
    label: "Keluar dari Layar Penuh (Fullscreen Exited)",
    desc: "Mode layar penuh (fullscreen) telah ditinggalkan. Lingkungan pengujian terstandar mewajibkan fullscreen aktif.",
  },
  TAB_OR_WINDOW_LEFT: {
    label: "Lingkungan Asesmen Kehilangan Fokus / Visibilitas",
    desc: "Assessment environment lost focus/visibility. Jendela browser diminimalkan, beralih aplikasi, atau tab tidak terlihat.",
  },
  PAGE_HIDDEN: {
    label: "Halaman Tidak Terlihat (Page Hidden)",
    desc: "Visibilitas tab peramban terputus selama pengerjaan modul aktif.",
  },
  WINDOW_BLUR: {
    label: "Fokus Jendela Hilang (Window Blur)",
    desc: "Fokus kursor atau jendela aktif beralih keluar dari area tes simulasi.",
  },
  OTHER_INTEGRITY_EVENT: {
    label: "Aksi Pembatas Integritas Terdeteksi",
    desc: "Aksi yang tidak diperkenankan terdeteksi dalam mode simulasi penuh.",
  },
};

export default function SimulationTerminatedPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchState() {
      try {
        const res = await fetch(`/api/assessment/sync?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.success && data.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, [sessionId]);

  const reasonKey = session?.terminationReason || "FULLSCREEN_EXITED";
  const reasonInfo = REASON_DESCRIPTIONS[reasonKey] || REASON_DESCRIPTIONS.OTHER_INTEGRITY_EVENT;
  const currentMod = session?.currentModuleNum || 1;
  const totalMod = session?.totalModules || 21;

  return (
    <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-4">
      <div className="mx-auto max-w-lg w-full rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 shadow-xl text-center">
        {/* Warning Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-5 border border-rose-200">
          <AlertOctagon className="h-9 w-9" />
        </div>

        {/* Title */}
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
          INTEGRITY TERMINATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2 mb-2">
          Simulation Ended
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          This simulation was ended because the assessment environment was exited or an integrity-triggering action was detected.
        </p>

        {/* Termination Reason Card */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-left mb-6 space-y-2">
          <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>Penyebab Penghentian Sesi:</span>
          </div>
          <p className="text-sm font-bold text-rose-950">
            {reasonInfo.label}
          </p>
          <p className="text-xs text-rose-900/90 leading-relaxed">
            {reasonInfo.desc}
          </p>
        </div>

        {/* Progress & Saved Notification Box */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs mb-6">
          <div className="text-left">
            <span className="text-slate-500 text-[11px] block">Progres Terakhir:</span>
            <strong className="text-slate-900 text-sm">Modul {currentMod} dari {totalMod}</strong>
          </div>
          <div className="text-left">
            <span className="text-slate-500 text-[11px] block">Status Jawaban:</span>
            <span className="text-emerald-700 font-semibold flex items-center mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Tersimpan di Server
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mb-6 italic">
          *Jawaban yang telah Anda submit sebelum peristiwa integritas telah direkam dan dievaluasi sebagai <strong>Hasil Parsial (Partial Simulation)</strong>. Sesi ini tidak dapat dilanjutkan kembali.
        </p>

        {/* Actions (NO Resume Button Allowed) */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <Link href={`/simulation/results/${sessionId}`}>
            <Button size="lg" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span>View Partial Results (Lihat Hasil Parsial)</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>

          <Link href="/simulation/prepare" className="block w-full">
            <Button variant="outline" size="sm" className="w-full text-xs text-slate-700 border-slate-300 hover:bg-slate-50">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-blue-900" />
              <span>Mulai Simulasi Baru</span>
            </Button>
          </Link>

          <Link href="/" className="block w-full">
            <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 hover:text-slate-700">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

