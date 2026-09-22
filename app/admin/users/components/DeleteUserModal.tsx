import React from "react";
import { AlertCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserItem } from "./useAdminUsers";

interface DeleteUserModalProps {
  targetUser: UserItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export function DeleteUserModal({
  targetUser,
  isDeleting,
  onClose,
  onConfirmDelete,
}: DeleteUserModalProps) {
  if (!targetUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-red-200 p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <div className="flex items-center space-x-2 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <h3 className="text-sm font-bold">Konfirmasi Hapus Akun</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0 text-slate-400">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <p>
            Apakah Anda yakin ingin menghapus akun pengguna berikut secara permanen?
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="font-bold text-slate-900 block">{targetUser.displayName}</span>
            <span className="text-[11px] text-slate-500 font-mono block">{targetUser.email}</span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Peran: {targetUser.role} · Sesi: {targetUser._count?.sessions || 0}
            </span>
          </div>
          <p className="text-rose-600 font-semibold text-[11px]">
            Peringatan: Seluruh riwayat sesi asesmen, modul, attempt, dan laporan kendala yang terkait dengan akun ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isDeleting} className="text-xs">
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
