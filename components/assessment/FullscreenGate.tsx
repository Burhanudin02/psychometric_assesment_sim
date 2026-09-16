"use client";

import React, { useState } from "react";
import { Maximize, AlertCircle, ShieldCheck, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenGateProps {
  onStart: () => void;
  isLoading?: boolean;
}

export function FullscreenGate({ onStart, isLoading = false }: FullscreenGateProps) {
  const [agreedInstructions, setAgreedInstructions] = useState(false);
  const [agreedFullscreen, setAgreedFullscreen] = useState(false);

  const canStart = agreedInstructions && agreedFullscreen && !isLoading;

  const handleStart = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Fullscreen might be blocked by browser policy without active user gesture
    }
    onStart();
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      {/* Title */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center space-x-2 text-blue-900 mb-1">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Simulasi Asesmen Kognitif
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Penjelasan & Persetujuan Asesmen
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Harap baca petunjuk pelaksanaan dengan saksama sebelum memulai simulasi.
        </p>
      </div>

      {/* Confirmed Manual Rules Box */}
      <div className="space-y-3.5 text-sm text-slate-700 bg-slate-50/80 p-5 rounded-lg border border-slate-200 mb-6">
        <div className="flex items-start space-x-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
            1
          </span>
          <p>
            Asesmen terdiri atas <strong>21 subtes berturut-turut</strong> yang dikerjakan secara non-stop hingga mencapai halaman akhir <em>“Terima Kasih”</em>.
          </p>
        </div>

        <div className="flex items-start space-x-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
            2
          </span>
          <p>
            Batas waktu setiap subtes terbatas (<strong>sekitar 1 menit per modul</strong>). Petunjuk sisa waktu selalu terlihat di pojok kanan atas.
          </p>
        </div>

        <div className="flex items-start space-x-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
            3
          </span>
          <p>
            Jika waktu modul habis, halaman akan <strong>otomatis berpindah ke modul berikutnya</strong> dan seluruh jawaban yang telah dipilih akan tersimpan di server.
          </p>
        </div>

        <div className="flex items-start space-x-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
            4
          </span>
          <p>
            Soal pada beberapa subtes <strong>dapat terlihat berulang</strong>. Hal tersebut merupakan karakteristik tes; Anda harus tetap mengerjakannya dan pastikan untuk <strong>melakukan scroll</strong> ke bawah.
          </p>
        </div>

        <div className="flex items-start space-x-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
            5
          </span>
          <p>
            Dilarang menggunakan kalkulator, alat bantu hitung, maupun bantuan pihak luar selama pengerjaan simulasi.
          </p>
        </div>
      </div>

      {/* Notice about timer start */}
      <div className="flex items-center space-x-2.5 rounded-md bg-amber-50 p-3 text-xs font-medium text-amber-900 border border-amber-200 mb-6">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
        <span>
          Waktu pengerjaan modul baru akan mulai berjalan setelah Anda menekan tombol <strong>“Mulai Asesmen”</strong> di bawah ini.
        </span>
      </div>

      {/* The 2 Confirmed Checkboxes */}
      <div className="space-y-4 border-t border-slate-100 pt-5 mb-6">
        <label
          onClick={() => setAgreedInstructions(!agreedInstructions)}
          className="flex items-start space-x-3 cursor-pointer select-none"
        >
          {agreedInstructions ? (
            <CheckSquare className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium text-slate-800">
            Saya telah membaca dan memahami seluruh petunjuk pelaksanaan asesmen.
          </span>
        </label>

        <label
          onClick={() => setAgreedFullscreen(!agreedFullscreen)}
          className="flex items-start space-x-3 cursor-pointer select-none"
        >
          {agreedFullscreen ? (
            <CheckSquare className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium text-slate-800">
            Saya bersedia mengerjakan asesmen dalam mode layar penuh (fullscreen) secara mandiri tanpa menggunakan kalkulator atau bantuan luar.
          </span>
        </label>
      </div>

      {/* Start Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 flex items-center space-x-1">
          <Maximize className="h-3.5 w-3.5" />
          <span>Layar penuh (F11 / Control+Cmd+F)</span>
        </div>

        <Button
          size="lg"
          disabled={!canStart}
          onClick={handleStart}
          className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 font-bold px-8 shadow-md"
        >
          {isLoading ? "Menyiapkan Sesi..." : "Mulai Asesmen (Selanjutnya)"}
        </Button>
      </div>
    </div>
  );
}
