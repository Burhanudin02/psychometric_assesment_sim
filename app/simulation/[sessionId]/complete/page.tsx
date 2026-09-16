"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimulationCompletePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="mx-auto max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle className="h-10 w-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Terima Kasih
        </h1>

        <div className="space-y-3 text-sm text-slate-600 leading-relaxed mb-8">
          <p className="font-semibold text-slate-800">
            Seluruh rangkaian 21 subtes asesmen telah selesai Anda kerjakan.
          </p>
          <p>
            Seluruh jawaban Anda telah berhasil tersimpan secara aman di server simulator. Sesi simulasi berkecepatan tinggi ini telah tuntas.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <Link href={`/simulation/results/${sessionId}`}>
            <Button size="lg" className="w-full bg-blue-900 hover:bg-blue-800 font-bold shadow-md text-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span>Buka Analisis & Evaluasi Training</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-700">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
