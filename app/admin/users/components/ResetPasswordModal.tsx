import React, { useState } from "react";
import { X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserItem } from "./useAdminUsers";

interface ResetPasswordModalProps {
  targetUser: UserItem | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ResetPasswordModal({
  targetUser,
  onClose,
  onSuccess,
  onError,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          action: "RESET_PASSWORD",
          value: newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(`Kata sandi akun ${targetUser.email} berhasil direset.`);
        onClose();
      } else {
        onError(data.error || "Gagal mereset kata sandi.");
      }
    } catch (err: any) {
      onError(err.message || "Kesalahan jaringan saat mereset kata sandi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-900">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold">Reset Kata Sandi Pengguna</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block">{targetUser.displayName}</span>
            <span className="text-[11px] text-slate-500 font-mono">{targetUser.email}</span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button size="sm" type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={isSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white">
              {isSubmitting ? "Menyimpan..." : "Reset Kata Sandi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
