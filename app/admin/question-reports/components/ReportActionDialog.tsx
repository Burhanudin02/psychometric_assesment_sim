import React, { useState } from "react";
import { X, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportItem } from "./useQuestionReports";

interface ReportActionDialogProps {
  report: ReportItem | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ReportActionDialog({
  report,
  onClose,
  onSuccess,
  onError,
}: ReportActionDialogProps) {
  const [status, setStatus] = useState<string>(report?.status || "OPEN");
  const [adminNote, setAdminNote] = useState<string>(report?.adminNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          status,
          adminNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess("Status laporan dan catatan tindak lanjut berhasil diperbarui.");
        onClose();
      } else {
        onError(data.error || "Gagal memperbarui status laporan.");
      }
    } catch (err: any) {
      onError(err.message || "Kesalahan jaringan saat memperbarui laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tindak Lanjuti Laporan #{report.id.substring(0, 8)}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Butir Soal: {report.questionId} (v{report.questionVersion})
            </span>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Question & Complaint Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div>
              <span className="font-semibold text-slate-500 text-[10px] uppercase">Soal:</span>
              <p className="text-slate-800 line-clamp-2 mt-0.5">{report.question?.prompt}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500 text-[10px] uppercase">Keluhan Pelapor:</span>
              <p className="text-slate-800 italic mt-0.5">
                &quot;{report.comment || "Tanpa komentar tambahan"}&quot;
              </p>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Status Penanganan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
            >
              <option value="OPEN">OPEN (Perlu Tindakan)</option>
              <option value="IN_REVIEW">IN_REVIEW (Sedang Ditinjau Tim Ahli)</option>
              <option value="RESOLVED">RESOLVED (Telah Diperbaiki / Terselesaikan)</option>
              <option value="DISMISSED">DISMISSED (Ditolak / Laporan Tidak Valid)</option>
              <option value="DUPLICATE">DUPLICATE (Laporan Duplikat)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Catatan Tindak Lanjut Administrator (Admin Note)
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Tuliskan catatan perbaikan atau alasan penutupan tiket laporan ini..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <a
              href={`/admin?id=${report.questionId}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:underline text-[11px] inline-flex items-center"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              <span>Buka Editor Soal</span>
            </a>

            <div className="flex space-x-2">
              <Button size="sm" type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white">
                <Check className="h-3.5 w-3.5 mr-1" />
                <span>Simpan Perubahan</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
