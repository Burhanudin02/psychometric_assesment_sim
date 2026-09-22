import React from "react";
import { MessageSquare, AlertTriangle, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportItem } from "./useQuestionReports";

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  AMBIGUOUS_MULTIPLE_ANSWERS: { label: "Ambigu / Multi-Tafsir", color: "bg-amber-100 text-amber-900 border-amber-200" },
  IMAGE_UNCLEAR: { label: "Gambar Tidak Jelas", color: "bg-orange-100 text-orange-900 border-orange-200" },
  INCORRECT_ANSWER_KEY: { label: "Kunci Jawaban Salah", color: "bg-rose-100 text-rose-900 border-rose-200" },
  QUESTION_INCOMPLETE: { label: "Soal Terpotong", color: "bg-purple-100 text-purple-900 border-purple-200" },
  BROKEN_IMAGE: { label: "Gambar Rusak", color: "bg-red-100 text-red-900 border-red-200" },
  TYPO_FORMATTING: { label: "Typo / Format", color: "bg-blue-100 text-blue-900 border-blue-200" },
  OTHER: { label: "Lainnya", color: "bg-slate-100 text-slate-900 border-slate-200" },
};

interface ReportTableProps {
  reports: ReportItem[];
  onOpenAction: (report: ReportItem) => void;
}

export function ReportTable({ reports, onOpenAction }: ReportTableProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
        Tidak ada laporan kendala soal yang cocok dengan filter saat ini.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
              <th className="py-3 px-4">Alasan & Komentar Pelapor</th>
              <th className="py-3 px-4 max-w-xs">Butir Soal Terdampak</th>
              <th className="py-3 px-4">Pelapor</th>
              <th className="py-3 px-4">Status Laporan</th>
              <th className="py-3 px-4">Waktu Lapor</th>
              <th className="py-3 px-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {reports.map((r) => {
              const reasonInfo = REASON_LABELS[r.reason] || { label: r.reason, color: "bg-slate-100 text-slate-800" };
              const isAutoFlagged = (r.question?.reportCount || 0) >= 3;

              return (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 max-w-sm">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1 ${reasonInfo.color}`}>
                      {reasonInfo.label}
                    </span>
                    {r.comment ? (
                      <p className="text-slate-800 leading-relaxed font-normal bg-slate-50 p-2 rounded border border-slate-100">
                        &quot;{r.comment}&quot;
                      </p>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic block">Tidak ada catatan tambahan</span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] font-bold text-slate-900 mb-0.5">
                      <span>{r.questionId}</span>
                      <span className="text-slate-400 font-normal">v{r.questionVersion}</span>
                      {isAutoFlagged && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          AUTO-FLAGGED
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-slate-700 text-[11px]">
                      {r.question?.prompt}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">
                      {r.user?.displayName || "Kandidat"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {r.user?.email || "Anonim"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === "OPEN"
                          ? "bg-rose-100 text-rose-800"
                          : r.status === "IN_REVIEW"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.adminNote && (
                      <div className="text-[10px] text-slate-500 mt-1 flex items-start space-x-1">
                        <MessageSquare className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-1 italic">{r.adminNote}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenAction(r)}
                      className="text-[11px] h-8 px-2.5"
                    >
                      <span>Tindak Lanjuti</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
