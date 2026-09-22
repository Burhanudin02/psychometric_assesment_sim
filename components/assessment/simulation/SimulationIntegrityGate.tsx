import React from "react";
import { Maximize2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimulationIntegrityGateProps {
  onActivateFullscreen: () => void;
}

export function SimulationIntegrityGate({ onActivateFullscreen }: SimulationIntegrityGateProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-900">
          <ShieldAlert className="h-6 w-6 text-blue-700" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Mode Layar Penuh Diperlukan
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Simulasi Penuh 21 Modul mewajibkan mode layar penuh (fullscreen) untuk
            menjamin kondisi asesmen yang otentik.
          </p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-[11px] text-amber-900 space-y-1">
          <span className="font-bold flex items-center">
            Aturan Integritas Ujian:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700">
            <li>Menekan tombol <strong>Esc</strong> atau <strong>Alt</strong> akan menghentikan sesi.</li>
            <li>Keluar dari mode layar penuh akan menghentikan simulasi.</li>
            <li>Pindah tab atau jendela lain akan membatalkan sesi.</li>
          </ul>
        </div>
        <Button
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs py-2.5"
          onClick={onActivateFullscreen}
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Aktifkan Layar Penuh & Lanjutkan
        </Button>
      </div>
    </div>
  );
}
