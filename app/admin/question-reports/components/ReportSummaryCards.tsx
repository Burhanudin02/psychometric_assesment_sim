import React from "react";
import { Flag, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface ReportSummaryCardsProps {
  summary: {
    total?: number;
    open?: number;
    inReview?: number;
    resolved?: number;
    dismissed?: number;
    autoFlaggedQuestions?: number;
  };
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center space-x-2 text-slate-500 mb-1">
          <Flag className="h-4 w-4 text-blue-600" />
          <span className="text-[11px] font-semibold">Total Laporan Masuk</span>
        </div>
        <span className="text-2xl font-black text-slate-900">{summary.total || 0}</span>
      </div>

      <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 shadow-2xs">
        <div className="flex items-center space-x-2 text-rose-700 mb-1">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <span className="text-[11px] font-semibold">Belum Ditindak (OPEN)</span>
        </div>
        <span className="text-2xl font-black text-rose-700">{summary.open || 0}</span>
      </div>

      <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-2xs">
        <div className="flex items-center space-x-2 text-amber-700 mb-1">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-[11px] font-semibold">Sedang Ditinjau</span>
        </div>
        <span className="text-2xl font-black text-amber-700">{summary.inReview || 0}</span>
      </div>

      <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
        <div className="flex items-center space-x-2 text-emerald-700 mb-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-[11px] font-semibold">Terselesaikan</span>
        </div>
        <span className="text-2xl font-black text-emerald-700">{summary.resolved || 0}</span>
      </div>
    </div>
  );
}
