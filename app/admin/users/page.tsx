"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, UserPlus, Search, Check, AlertCircle, BookOpen, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";
import { useAdminUsers, UserItem } from "./components/useAdminUsers";
import { UserTable } from "./components/UserTable";
import { AddUserModal } from "./components/AddUserModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { DeleteUserModal } from "./components/DeleteUserModal";

export default function AdminUsersPage() {
  const {
    filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    statusMsg,
    setStatusMsg,
    errorMsg,
    setErrorMsg,
    loadUsers,
  } = useAdminUsers();

  const [showAddModal, setShowAddModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<UserItem | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleToggleRole = async (user: UserItem) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: "SET_ROLE", value: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Peran ${user.email} diubah menjadi ${newRole}.`);
        await loadUsers();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: "SET_STATUS", value: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Status akun ${user.email} diubah menjadi ${newStatus}.`);
        await loadUsers();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTargetUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || "Pengguna berhasil dihapus.");
        setDeleteTargetUser(null);
        await loadUsers();
      } else {
        setErrorMsg(data.error || "Gagal menghapus pengguna.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Kesalahan jaringan saat menghapus pengguna.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="text-slate-500 hover:text-slate-800 transition-colors p-1 -ml-1 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Manajemen Pengguna & Hak Akses
              </h1>
            </div>
            <BetaBadge />
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/admin">
              <Button size="sm" variant="outline" className="text-xs h-8">
                <BookOpen className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                <span>Bank Soal</span>
              </Button>
            </Link>
            <Link href="/admin/question-reports">
              <Button size="sm" variant="outline" className="text-xs h-8">
                <Flag className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                <span>Laporan Soal</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-5">
        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{statusMsg}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="text-emerald-600 font-bold">×</button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold">×</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari email atau nama pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 hover:bg-blue-800 text-white text-xs h-9"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            <span>Tambah Pengguna</span>
          </Button>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
            Memuat daftar pengguna...
          </div>
        ) : (
          <UserTable
            users={filteredUsers}
            onToggleRole={handleToggleRole}
            onToggleStatus={handleToggleStatus}
            onOpenResetPassword={setResetTargetUser}
            onOpenDelete={setDeleteTargetUser}
          />
        )}
      </main>

      {/* 3. Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => {
            setStatusMsg(msg);
            loadUsers();
          }}
          onError={setErrorMsg}
        />
      )}

      {resetTargetUser && (
        <ResetPasswordModal
          targetUser={resetTargetUser}
          onClose={() => setResetTargetUser(null)}
          onSuccess={setStatusMsg}
          onError={setErrorMsg}
        />
      )}

      {deleteTargetUser && (
        <DeleteUserModal
          targetUser={deleteTargetUser}
          isDeleting={deleting}
          onClose={() => setDeleteTargetUser(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
