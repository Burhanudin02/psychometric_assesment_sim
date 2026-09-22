import React from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsHeaderBannerProps {
  sessionId: string;
}

export function ResultsHeaderBanner({ sessionId }: ResultsHeaderBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 py-4 gap-4 sticky top-0 z-20 shadow-2xs">
      <div className="flex items-center space-x-3">
        <Link
          href="/"
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Laporan Analisis Performa Kognitif
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
              Selesai Penuh (21 Modul)
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Sesi ID: {sessionId}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Link href="/simulation/prepare">
          <Button
            size="sm"
            className="bg-blue-900 hover:bg-blue-800 text-white text-xs h-9 px-4 shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            <span>Simulasi Ulang</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
