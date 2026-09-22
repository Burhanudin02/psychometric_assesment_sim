"use client";

import React, { useState } from "react";
import { Flag, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportQuestionModalProps {
  isOpen?: boolean;
  onClose: () => void;
  questionId: string;
  questionVersion?: number;
  sessionId?: string;
  anonymousToken?: string;
}

const REPORT_REASONS = [
  {
    id: "AMBIGUOUS_MULTIPLE_ANSWERS",
    label: "Ambigu / Multi-Tafsir",
    desc: "Ada lebih dari satu jawaban yang secara logika benar.",
  },
  {
    id: "IMAGE_UNCLEAR",
    label: "Gambar Tidak Jelas / Kabur",
    desc: "Visual, diagram, atau pola gambar sulit dilihat detailnya.",
  },
  {
    id: "INCORRECT_ANSWER_KEY",
    label: "Kunci Jawaban Diduga Salah",
    desc: "Kunci jawaban tidak sesuai dengan penalaran objektif.",
  },
  {
    id: "QUESTION_INCOMPLETE",
    label: "Informasi Soal Terpotong",
    desc: "Kalimat pertanyaan tidak utuh atau instruksi hilang.",
  },
  {
    id: "BROKEN_IMAGE",
    label: "Gambar Gagal Dimuat / Rusak",
    desc: "Gambar atau SVG tidak muncul atau rusak.",
  },
  {
    id: "TYPO_FORMATTING",
    label: "Kesalahan Ketik / Pemformatan",
    desc: "Typo teks atau tata letak soal membingungkan.",
  },
  {
    id: "OTHER",
    label: "Kendala Lainnya",
    desc: "Masalah kualitas atau kejelasan lainnya.",
  },
];

export function ReportQuestionModal({
  isOpen = true,
  onClose,
  questionId,
  questionVersion = 1,
  sessionId,
  anonymousToken,
}: ReportQuestionModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("AMBIGUOUS_MULTIPLE_ANSWERS");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/questions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          questionVersion,
          reason: selectedReason,
          comment: comment.trim(),
          sessionId,
          anonymousToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: data.message || "Laporan Anda telah berhasil dicatat untuk ditinjau.",
        });
        setTimeout(() => {
          onClose();
          setStatusMessage(null);
          setComment("");
        }, 1500);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Gagal mengirimkan laporan.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Terjadi kesalahan jaringan.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30">
              <Flag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Laporkan Kendala Soal</h3>
              <p className="text-[11px] text-slate-300">
                ID Soal: <span className="font-mono text-amber-300">{questionId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start space-x-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{statusMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alasan Pelaporan:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start space-x-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedReason === r.id
                      ? "border-rose-400 bg-rose-50/40 text-slate-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-semibold">{r.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Komentar Tambahan <span className="font-normal text-slate-400">(Opsional):</span>
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Jelaskan detail bagian mana yang ambigu atau tidak jelas..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              maxLength={400}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Waktu simulasi tetap berjalan. Anda dapat langsung kembali menjawab setelah mengirim laporan.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Lanjutkan Tes
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Flag className="h-3.5 w-3.5 mr-1" />
                  <span>Kirim Laporan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

