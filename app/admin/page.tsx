"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Check, AlertCircle } from "lucide-react";
import { BetaBadge } from "@/components/ui/BetaBadge";
import { useQuestionAdmin } from "./components/useQuestionAdmin";
import { QuestionFilterToolbar } from "./components/QuestionFilterToolbar";
import { QuestionTable } from "./components/QuestionTable";
import { QuestionFormModal } from "./components/QuestionFormModal";
import { QuestionDualPreviewModal } from "./components/QuestionDualPreviewModal";
import { QuestionDeleteModal } from "./components/QuestionDeleteModal";

export default function AdminQuestionsPage() {
  const {
    filteredQuestions,
    selectedDomain,
    setSelectedDomain,
    selectedQuality,
    setSelectedQuality,
    searchTerm,
    setSearchTerm,
    isLoading,
    statusMsg,
    setStatusMsg,
    errorMsg,
    setErrorMsg,
    loadQuestions,
    handleExportJson,
  } = useQuestionAdmin();

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);
  const [deleteTargetQuestion, setDeleteTargetQuestion] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (q: any) => {
    setEditingQuestion(q);
    setShowFormModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetQuestion) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions?id=${deleteTargetQuestion.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || `Soal ${deleteTargetQuestion.id} berhasil dihapus.`);
        setDeleteTargetQuestion(null);
        await loadQuestions();
      } else {
        setErrorMsg(data.error || "Gagal menghapus butir soal.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Kesalahan jaringan saat menghapus soal.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-800 transition-colors p-1 -ml-1 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Panel Manajemen Bank Soal
              </h1>
            </div>
            <BetaBadge />
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-5">
        {/* Status Alerts */}
        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{statusMsg}</span>
            </div>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Filter & Action Toolbar */}
        <QuestionFilterToolbar
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          selectedQuality={selectedQuality}
          onSelectQuality={setSelectedQuality}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenCreateModal={handleOpenCreateModal}
          onExportJson={handleExportJson}
        />

        {/* Questions Data Table */}
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
            Memuat data bank soal dan analitik performa butir...
          </div>
        ) : (
          <QuestionTable
            questions={filteredQuestions}
            onOpenPreview={setPreviewQuestion}
            onOpenEdit={handleOpenEditModal}
            onOpenDelete={setDeleteTargetQuestion}
          />
        )}
      </main>

      {/* 3. Subcomponent Modals */}
      {showFormModal && (
        <QuestionFormModal
          editingQuestionId={editingQuestion?.id || null}
          initialValues={editingQuestion || {}}
          onClose={() => setShowFormModal(false)}
          onSuccess={(msg) => {
            setStatusMsg(msg);
            loadQuestions();
          }}
          onError={setErrorMsg}
        />
      )}

      {previewQuestion && (
        <QuestionDualPreviewModal
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}

      {deleteTargetQuestion && (
        <QuestionDeleteModal
          targetQuestion={deleteTargetQuestion}
          isDeleting={isDeleting}
          onClose={() => setDeleteTargetQuestion(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
