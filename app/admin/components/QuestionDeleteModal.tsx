import React from "react";
import { AlertCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionDeleteModalProps {
  targetQuestion: any | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export function QuestionDeleteModal({
  targetQuestion,
  isDeleting,
  onClose,
  onConfirmDelete,
}: QuestionDeleteModalProps) {
  if (!targetQuestion) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-red-200 p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <div className="flex items-center space-x-2 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <h3 className="text-sm font-bold">Konfirmasi Hapus Butir Soal</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <p>
            Apakah Anda yakin ingin menghapus butir soal berikut secara permanen?
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-slate-900 block">
              {targetQuestion.id} ({targetQuestion.domain})
            </span>
            <p className="text-slate-600 line-clamp-2 italic">
              &quot;{targetQuestion.prompt}&quot;
            </p>
          </div>
          <p className="text-rose-600 font-semibold text-[11px]">
            Peringatan: Seluruh riwayat attempt, laporan kendala, dan snapshot versi untuk butir soal ini akan dibersihkan. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            <span>{isDeleting ? "Menghapus..." : "Hapus Permanen"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
