import React from "react";
import { Shield, ShieldAlert, KeyRound, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserItem } from "./useAdminUsers";

interface UserTableProps {
  users: UserItem[];
  onToggleRole: (user: UserItem) => void;
  onToggleStatus: (user: UserItem) => void;
  onOpenResetPassword: (user: UserItem) => void;
  onOpenDelete: (user: UserItem) => void;
}

export function UserTable({
  users,
  onToggleRole,
  onToggleStatus,
  onOpenResetPassword,
  onOpenDelete,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
        Tidak ditemukan akun pengguna yang cocok.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
              <th className="py-3 px-4">Nama & Email</th>
              <th className="py-3 px-4">Peran (Role)</th>
              <th className="py-3 px-4">Status Akun</th>
              <th className="py-3 px-4">Tanggal Daftar</th>
              <th className="py-3 px-4 text-right">Aktivitas</th>
              <th className="py-3 px-4 text-center">Tindakan Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.map((u) => {
              const isAdmin = u.role === "ADMIN";
              const isActive = u.status === "ACTIVE";

              return (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">
                      {u.displayName || "Kandidat"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {u.email || "Akun Anonim"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {isAdmin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        <Shield className="h-3 w-3 mr-1 text-purple-600" />
                        ADMINISTRATOR
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        USER (Kandidat)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="h-3 w-3 mr-1 text-rose-600" />
                        DISABLED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <div className="text-slate-900 font-semibold">
                      {u._count?.sessions || 0} sesi
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {u._count?.reports || 0} laporan
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onToggleRole(u)}
                        className="h-8 px-2 text-[11px] text-slate-600 hover:text-purple-700 hover:bg-purple-50"
                        title="Ubah peran"
                      >
                        <Shield className="h-3.5 w-3.5 mr-1" />
                        <span>{isAdmin ? "Jadikan User" : "Jadikan Admin"}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onToggleStatus(u)}
                        className={`h-8 px-2 text-[11px] ${
                          isActive
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title="Ubah status akun"
                      >
                        {isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenResetPassword(u)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-700"
                        title="Reset Kata Sandi"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenDelete(u)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-700"
                        title="Hapus Akun Pengguna"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
