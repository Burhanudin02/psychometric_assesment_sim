"use client";

import React, { useState } from "react";
import { Maximize, AlertCircle, ShieldAlert, CheckSquare, Square, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenGateProps {
  onStart: () => void;
  isLoading?: boolean;
}

export function FullscreenGate({ onStart, isLoading = false }: FullscreenGateProps) {
  const [agreedInstructions, setAgreedInstructions] = useState(false);
  const [agreedIntegrity, setAgreedIntegrity] = useState(false);

  const canStart = agreedInstructions && agreedIntegrity && !isLoading;

  const handleStart = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Fullscreen might be subject to browser gesture policies
    }
    onStart();
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
      {/* Title Banner */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center space-x-2 text-rose-700 mb-1">
          <ShieldAlert className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            FULL SIMULATION — IMPORTANT
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Penjelasan & Protokol Integritas Asesmen
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
          Simulasi ini menggunakan mode layar penuh (fullscreen) dan mekanisme integritas ketat yang dirancang untuk mereproduksi kondisi psikotes berkecepatan tinggi yang sebenarnya.
        </p>
      </div>

      {/* Mandatory Integrity Restrictions Box (Section A2) */}
      <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-5 mb-6 text-xs sm:text-sm text-rose-950 space-y-3">
        <div className="font-bold flex items-center text-rose-900">
          <AlertCircle className="h-4 w-4 mr-2 shrink-0 text-rose-700" />
          <span>Setelah mode layar penuh (fullscreen) berhasil diaktifkan:</span>
        </div>

        <ul className="list-disc pl-5 space-y-1.5 text-rose-900 leading-relaxed text-xs">
          <li>
            Menekan tombol <strong>Esc (Escape)</strong> akan langsung <strong>menghentikan (terminate)</strong> simulasi;
          </li>
          <li>
            Menekan tombol <strong>Alt</strong> akan langsung <strong>menghentikan</strong> simulasi;
          </li>
          <li>
            Keluar dari mode layar penuh (fullscreen) akan langsung <strong>menghentikan</strong> simulasi;
          </li>
          <li>
            Beralih tab atau memindahkan fokus jendela browser (blur/visibility change) akan langsung <strong>menghentikan</strong> simulasi;
          </li>
          <li>
            Simulasi <strong>tidak dapat dijeda (cannot be paused)</strong> hingga seluruh 21 modul selesai.
          </li>
        </ul>

        <p className="text-[11px] text-rose-800/90 pt-1 border-t border-rose-200/80 leading-normal">
          Jawaban Anda hingga saat peristiwa integritas terjadi akan disimpan, dihitung sebagai hasil parsial (<em>Partial Simulation</em>), dan tidak dapat dilanjutkan kembali. Pembatasan ini <strong>hanya berlaku untuk Mode Simulasi Penuh (Full Simulation Mode)</strong>.
        </p>
      </div>

      {/* Assessment Format Summary */}
      <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
        <div className="flex items-start space-x-2.5">
          <span className="font-bold text-blue-900">•</span>
          <p>
            Asesmen terdiri atas <strong>21 subtes berturut-turut</strong> (~1 menit per modul) non-stop.
          </p>
        </div>
        <div className="flex items-start space-x-2.5">
          <span className="font-bold text-blue-900">•</span>
          <p>
            Waktu setiap modul berjalan di server; halaman otomatis berganti saat waktu habis.
          </p>
        </div>
        <div className="flex items-start space-x-2.5">
          <span className="font-bold text-blue-900">•</span>
          <p>
            Dilarang menggunakan kalkulator, catatan, atau bantuan eksternal.
          </p>
        </div>
      </div>

      {/* Mandatory Checkboxes */}
      <div className="space-y-3.5 border-t border-slate-100 pt-5 mb-6 text-xs sm:text-sm">
        <label
          onClick={() => setAgreedInstructions(!agreedInstructions)}
          className="flex items-start space-x-3 cursor-pointer select-none"
        >
          {agreedInstructions ? (
            <CheckSquare className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          )}
          <span className="font-medium text-slate-800">
            Saya telah membaca dan memahami seluruh petunjuk pelaksanaan asesmen.
          </span>
        </label>

        <label
          onClick={() => setAgreedIntegrity(!agreedIntegrity)}
          className="flex items-start space-x-3 cursor-pointer select-none"
        >
          {agreedIntegrity ? (
            <CheckSquare className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          )}
          <span className="font-semibold text-slate-900">
            I understand that leaving the assessment environment will end this simulation. (Saya memahami bahwa keluar dari lingkungan asesmen akan langsung mengakhiri simulasi ini).
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-400 flex items-center space-x-1.5">
          <Maximize className="h-3.5 w-3.5" />
          <span>Fullscreen terverifikasi otomatis</span>
        </div>

        <Button
          size="lg"
          disabled={!canStart}
          onClick={handleStart}
          className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 shadow-md"
        >
          {isLoading ? "Menyiapkan Sesi..." : "Enter Full Simulation"}
        </Button>
      </div>
    </div>
  );
}
