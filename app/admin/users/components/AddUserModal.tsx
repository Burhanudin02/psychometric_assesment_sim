import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function AddUserModal({ onClose, onSuccess, onError }: AddUserModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, role }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess("Pengguna baru berhasil ditambahkan.");
        onClose();
      } else {
        onError(data.error || "Gagal membuat akun.");
      }
    } catch (err: any) {
      onError(err.message || "Kesalahan jaringan saat membuat pengguna.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-900">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold">Tambah Pengguna Baru</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nama Lengkap / Panggilan
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Contoh: Budi Pratama"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kandidat@example.com"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Kata Sandi Awal</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Peran Akses (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
            >
              <option value="USER">USER (Kandidat Peserta)</option>
              <option value="ADMIN">ADMIN (Hak Akses Penuh)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button size="sm" type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={isSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white">
              {isSubmitting ? "Menyimpan..." : "Buat Akun"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
