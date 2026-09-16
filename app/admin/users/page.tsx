"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  XCircle,
  Search,
  BookOpen,
  Flag,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";

interface UserItem {
  id: string;
  email: string | null;
  displayName: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  lastLoginAt: string | null;
  _count?: {
    sessions: number;
    reports: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New user modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");

  // Reset password modal
  const [resetTargetUser, setResetTargetUser] = useState<UserItem | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          displayName: newName,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Pengguna baru berhasil ditambahkan.");
        setShowAddModal(false);
        setNewEmail("");
        setNewPassword("");
        setNewName("");
        loadUsers();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleRole = async (user: UserItem) => {
    const targetRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const confirmMsg =
      targetRole === "ADMIN"
        ? `Jadikan ${user.email || user.displayName} sebagai Administrator?`
        : `Turunkan hak akses ${user.email || user.displayName} menjadi Pengguna biasa?`;

    if (!window.confirm(confirmMsg)) return;

    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: targetRole }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Hak akses ${user.email || user.displayName} diubah menjadi ${targetRole}.`);
        loadUsers();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const targetStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const confirmMsg =
      targetStatus === "DISABLED"
        ? `Nonaktifkan akun ${user.email || user.displayName}? Pengguna tidak akan dapat masuk.`
        : `Aktifkan kembali akun ${user.email || user.displayName}?`;

    if (!window.confirm(confirmMsg)) return;

    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status: targetStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Status akun diubah menjadi ${targetStatus}.`);
        loadUsers();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    if (resetPasswordVal.trim().length < 6) {
      alert("Kata sandi baru minimal 6 karakter.");
      return;
    }

    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resetTargetUser.id,
          newPassword: resetPasswordVal.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Kata sandi untuk ${resetTargetUser.email} berhasil diatur ulang.`);
        setResetTargetUser(null);
        setResetPasswordVal("");
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const filtered = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(search)) ||
      (u.displayName && u.displayName.toLowerCase().includes(search)) ||
      u.role.toLowerCase().includes(search)
    );
  });

  const adminCount = users.filter((u) => u.role === "ADMIN" && u.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Panel Admin</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-blue-900" />
              <span>Manajemen Pengguna & Otorisasi</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <BetaBadge />
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-blue-900 hover:bg-blue-800 text-xs font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              <span>Tambah Pengguna</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex space-x-6 text-xs font-medium border-t border-slate-100">
          <Link
            href="/admin"
            className="py-3 text-slate-500 hover:text-slate-900 flex items-center space-x-1.5 border-b-2 border-transparent"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Bank Soal & Kurikulum</span>
          </Link>
          <Link
            href="/admin/question-reports"
            className="py-3 text-slate-500 hover:text-slate-900 flex items-center space-x-1.5 border-b-2 border-transparent"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Laporan Soal</span>
          </Link>
          <Link
            href="/admin/users"
            className="py-3 text-blue-900 border-b-2 border-blue-900 font-bold flex items-center space-x-1.5"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Pengguna & Hak Akses</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Messages */}
        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg(null)}><X className="h-4 w-4" /></button>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center"><AlertCircle className="h-4 w-4 mr-1.5 shrink-0" />{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Total Akun Terdaftar</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Administrator Aktif</div>
            <div className="text-2xl font-bold text-blue-900 mt-1 flex items-center">
              {adminCount}
              <span className="text-xs font-normal text-slate-400 ml-2">(Minimal 1 terlindungi)</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Pengguna / Kandidat</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">
              {users.filter((u) => u.role === "USER").length}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari email, nama, atau role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="text-xs text-slate-500">
            Menampilkan <span className="font-bold text-slate-800">{filtered.length}</span> akun
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4 text-center">Hak Akses (Role)</th>
                  <th className="py-3 px-4 text-center">Status Akun</th>
                  <th className="py-3 px-4 text-center">Aktivitas Sesi</th>
                  <th className="py-3 px-4">Terdaftar</th>
                  <th className="py-3 px-4 text-right">Aksi Administrator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Memuat daftar pengguna...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada pengguna yang cocok.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const isAdmin = u.role === "ADMIN";
                    const isActive = u.status === "ACTIVE";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {u.displayName || "Kandidat"}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {u.email || "Akun Tamu (Anonymous)"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAdmin
                                ? "bg-blue-100 text-blue-900 border border-blue-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isAdmin ? <Shield className="h-3 w-3 mr-1" /> : null}
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          <span className="font-semibold">{u._count?.sessions || 0}</span> sesi simulasi
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleRole(u)}
                            className="h-7 px-2 text-[11px]"
                            title="Ubah hak akses antara User dan Admin"
                          >
                            {isAdmin ? "Jadikan User" : "Jadikan Admin"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(u)}
                            className={`h-7 px-2 text-[11px] ${
                              isActive ? "text-rose-700 hover:bg-rose-50" : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                          {u.email && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setResetTargetUser(u);
                                setResetPasswordVal("");
                              }}
                              className="h-7 px-2 text-[11px] text-slate-600"
                              title="Reset kata sandi pengguna"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Tambah Akun Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Tampilan</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama Lengkap Kandidat..."
                  className="w-full p-2 border rounded border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="kandidat@perusahaan.com"
                  className="w-full p-2 border rounded border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kata Sandi (Minimal 6 Karakter)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2 border rounded border-slate-300"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tingkat Hak Akses (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2 border rounded border-slate-300"
                >
                  <option value="USER">USER (Kandidat Ujian Biasa)</option>
                  <option value="ADMIN">ADMIN (Pengelola Sistem Penuh)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-blue-900 hover:bg-blue-800 font-bold text-white">
                  Buat Pengguna
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Reset Kata Sandi</h3>
              <button onClick={() => setResetTargetUser(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Masukkan kata sandi baru untuk akun:{" "}
              <strong className="text-slate-900 font-mono">{resetTargetUser.email}</strong>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="w-full p-2 border rounded border-slate-300"
                  required
                  minLength={6}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setResetTargetUser(null)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-blue-900 hover:bg-blue-800 font-bold text-white">
                  Simpan Sandi Baru
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

