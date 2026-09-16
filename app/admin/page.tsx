"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Plus,
  Download,
  Upload,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  Flag,
  Users,
  Eye,
  ImageIcon,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";
import { DOMAIN_LABELS } from "@/lib/curriculum";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";
import { QuestionItem } from "@/features/questions/types";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedQuality, setSelectedQuality] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [changeReason, setChangeReason] = useState("");
  const [deleteTargetQuestion, setDeleteTargetQuestion] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [qDomain, setQDomain] = useState("NUMERICAL_REASONING");
  const [qSubtopic, setQSubtopic] = useState("percentages");
  const [qDifficulty, setQDifficulty] = useState("MODERATE");
  const [qQualityStatus, setQQualityStatus] = useState("ACTIVE");
  const [qPrompt, setQPrompt] = useState("");
  const [qImageUrl, setQImageUrl] = useState("");
  const [qImagePos, setQImagePos] = useState<"ABOVE_QUESTION" | "BELOW_QUESTION" | "INLINE">("ABOVE_QUESTION");
  const [qSvgData, setQSvgData] = useState("");

  const [qOptionA, setQOptionA] = useState("");
  const [qOptionAImage, setQOptionAImage] = useState("");
  const [qOptionB, setQOptionB] = useState("");
  const [qOptionBImage, setQOptionBImage] = useState("");
  const [qOptionC, setQOptionC] = useState("");
  const [qOptionCImage, setQOptionCImage] = useState("");
  const [qOptionD, setQOptionD] = useState("");
  const [qOptionDImage, setQOptionDImage] = useState("");

  const [qCorrectAnswer, setQCorrectAnswer] = useState("A");
  const [qExplanation, setQExplanation] = useState("");
  const [qSolvingStrategy, setQSolvingStrategy] = useState("");

  // Image uploading states
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Dual Preview Modal state
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
  const [previewMode, setPreviewMode] = useState<"user" | "key">("user");
  const [previewSelectedAnswer, setPreviewSelectedAnswer] = useState<string | null>(null);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/questions?domain=${selectedDomain}&qualityStatus=${selectedQuality}`
      );
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedDomain, selectedQuality]);

  const handleExportJson = () => {
    window.open("/api/admin/export", "_blank");
  };

  const handleOpenCreateModal = () => {
    setEditingQuestionId(null);
    setChangeReason("");
    setQDomain("NUMERICAL_REASONING");
    setQSubtopic("percentages");
    setQDifficulty("MODERATE");
    setQQualityStatus("ACTIVE");
    setQPrompt("");
    setQImageUrl("");
    setQImagePos("ABOVE_QUESTION");
    setQSvgData("");
    setQOptionA("");
    setQOptionAImage("");
    setQOptionB("");
    setQOptionBImage("");
    setQOptionC("");
    setQOptionCImage("");
    setQOptionD("");
    setQOptionDImage("");
    setQCorrectAnswer("A");
    setQExplanation("");
    setQSolvingStrategy("");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (q: any) => {
    setEditingQuestionId(q.id);
    setChangeReason("");
    setQDomain(q.domain);
    setQSubtopic(q.subtopic);
    setQDifficulty(q.difficulty);
    setQQualityStatus(q.qualityStatus || (q.active ? "ACTIVE" : "DRAFT"));
    setQPrompt(q.prompt);
    setQImageUrl(q.image || "");
    setQImagePos(q.imagePosition || "ABOVE_QUESTION");
    setQSvgData(q.svgData || "");

    const optA = q.options?.find((o: any) => o.id === "A");
    const optB = q.options?.find((o: any) => o.id === "B");
    const optC = q.options?.find((o: any) => o.id === "C");
    const optD = q.options?.find((o: any) => o.id === "D");

    setQOptionA(optA?.text || "");
    setQOptionAImage(optA?.image || "");
    setQOptionB(optB?.text || "");
    setQOptionBImage(optB?.image || "");
    setQOptionC(optC?.text || "");
    setQOptionCImage(optC?.image || "");
    setQOptionD(optD?.text || "");
    setQOptionDImage(optD?.image || "");

    setQCorrectAnswer(q.correctAnswer || "A");
    setQExplanation(q.explanation || "");
    setQSolvingStrategy(q.solvingStrategy || "");
    setShowFormModal(true);
  };

  const handleImageUpload = async (file: File, target: "prompt" | "optA" | "optB" | "optC" | "optD") => {
    setIsUploadingImage(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (editingQuestionId) {
        formData.append("questionId", editingQuestionId);
      }
      if (target.startsWith("opt")) {
        formData.append("optionId", target.replace("opt", ""));
      }

      const res = await fetch("/api/admin/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah gambar.");
      }

      if (target === "prompt") setQImageUrl(data.url);
      if (target === "optA") setQOptionAImage(data.url);
      if (target === "optB") setQOptionBImage(data.url);
      if (target === "optC") setQOptionCImage(data.url);
      if (target === "optD") setQOptionDImage(data.url);

      setStatusMsg("Gambar berhasil diunggah!");
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses gambar.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const options = [
      { id: "A", text: qOptionA, image: qOptionAImage || undefined },
      { id: "B", text: qOptionB, image: qOptionBImage || undefined },
      { id: "C", text: qOptionC, image: qOptionCImage || undefined },
      { id: "D", text: qOptionD, image: qOptionDImage || undefined },
    ].filter((o) => Boolean(o.text) || Boolean(o.image));

    if (options.length < 2) {
      setErrorMsg("Wajib memiliki minimal 2 opsi jawaban (A dan B).");
      return;
    }

    if (qQualityStatus === "ACTIVE" && !qExplanation.trim()) {
      setErrorMsg("Penjelasan jawaban wajib diisi sebelum mengaktifkan butir soal (Quality: ACTIVE).");
      return;
    }

    const payload: any = {
      domain: qDomain,
      subtopic: qSubtopic,
      questionType: "TEXT_MCQ",
      difficulty: qDifficulty,
      qualityStatus: qQualityStatus,
      active: qQualityStatus === "ACTIVE",
      prompt: qPrompt,
      image: qImageUrl || null,
      imagePosition: qImagePos,
      svgData: qSvgData || null,
      options,
      correctAnswer: qCorrectAnswer,
      explanation: qExplanation,
      solvingStrategy: qSolvingStrategy,
      tags: ["admin_managed", qSubtopic],
    };

    try {
      let res;
      if (editingQuestionId) {
        payload.id = editingQuestionId;
        payload.changeReason = changeReason || "Pembaruan isi dan kunci jawaban oleh admin";
        res = await fetch("/api/admin/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan butir soal.");
      }

      setStatusMsg(
        editingQuestionId
          ? `Butir soal ${editingQuestionId} berhasil diperbarui (Snapshot versi tersimpan).`
          : "Butir soal baru berhasil ditambahkan."
      );
      setShowFormModal(false);
      loadQuestions();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          active: !currentActive,
          qualityStatus: !currentActive ? "ACTIVE" : "DRAFT",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id ? { ...q, active: !currentActive, qualityStatus: !currentActive ? "ACTIVE" : "DRAFT" } : q
          )
        );
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteTargetQuestion) return;
    setIsDeleting(true);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/admin/questions?id=${deleteTargetQuestion.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus butir soal.");
      }

      setStatusMsg(data.message || `Soal ${deleteTargetQuestion.id} berhasil dihapus permanen.`);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTargetQuestion.id));
      setDeleteTargetQuestion(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghapus butir soal.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenPreview = (q: any) => {
    setPreviewQuestion(q);
    setPreviewMode("user");
    setPreviewSelectedAnswer(null);
  };

  const filtered = questions.filter((q) => {
    if (searchTerm) {
      return (
        q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Beranda</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <Settings className="h-4 w-4 mr-1.5 text-blue-900" />
              <span>Manajemen Bank Soal & Kurikulum</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <BetaBadge />
            <Button size="sm" variant="outline" onClick={handleExportJson} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />
              <span>Ekspor JSON</span>
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreateModal}
              className="bg-blue-900 hover:bg-blue-800 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Tambah Soal</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex space-x-6 text-xs font-medium border-t border-slate-100">
          <Link
            href="/admin"
            className="py-3 text-blue-900 border-b-2 border-blue-900 font-bold flex items-center space-x-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Bank Soal & Kurikulum</span>
          </Link>
          <Link
            href="/admin/question-reports"
            className="py-3 text-slate-500 hover:text-slate-900 flex items-center space-x-1.5 border-b-2 border-transparent"
          >
            <Flag className="h-3.5 w-3.5 text-rose-600" />
            <span>Laporan Soal</span>
          </Link>
          <Link
            href="/admin/users"
            className="py-3 text-slate-500 hover:text-slate-900 flex items-center space-x-1.5 border-b-2 border-transparent"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Pengguna & Hak Akses</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 space-y-6">
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

        {/* Filters Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Domain:</span>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">Semua Domain ({questions.length})</option>
                {Object.entries(DOMAIN_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status Kualitas:</span>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">ACTIVE (Digunakan dalam Ujian)</option>
                <option value="REVIEW_REQUIRED">REVIEW_REQUIRED (Perlu Ditinjau)</option>
                <option value="DRAFT">DRAFT (Dalam Penyusunan)</option>
                <option value="DEPRECATED">DEPRECATED (Usang)</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari teks soal atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Questions Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-3">ID / Domain</th>
                  <th className="py-3 px-3">Teks & Visual Soal</th>
                  <th className="py-3 px-3 text-center">Kunci</th>
                  <th className="py-3 px-3 text-center">Versi</th>
                  <th className="py-3 px-3 text-center">Laporan</th>
                  <th className="py-3 px-3 text-center">Kualitas</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Memuat butir soal...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Tidak ada soal yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((q) => {
                    const hasReports = q.reportCount > 0 || (q._count?.reports > 0);
                    const qStatus = q.qualityStatus || (q.active ? "ACTIVE" : "DRAFT");

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 align-top">
                          <span className="font-mono font-bold text-slate-900 block">{q.id}</span>
                          <span className="text-[10px] text-slate-500">
                            {DOMAIN_LABELS[q.domain] || q.domain}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-md align-top">
                          <p className="line-clamp-2 text-slate-800 leading-snug">
                            {q.prompt}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {q.image && (
                              <span className="inline-flex items-center text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Gambar Soal
                              </span>
                            )}
                            {q.svgData && (
                              <span className="inline-flex items-center text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                Graphic SVG
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-blue-900 align-top">
                          {q.correctAnswer}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500 align-top">
                          v{q.version || 1}
                        </td>
                        <td className="py-3 px-3 text-center align-top">
                          {hasReports ? (
                            <Link href={`/admin/question-reports?search=${encodeURIComponent(q.id)}`}>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 hover:underline">
                                <Flag className="h-3 w-3 mr-1" />
                                {q.reportCount || q._count?.reports || 1} Laporan
                              </span>
                            </Link>
                          ) : (
                            <span className="text-[10px] text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center align-top">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              qStatus === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : qStatus === "REVIEW_REQUIRED"
                                ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                                : qStatus === "DRAFT"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {qStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 align-top">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenPreview(q)}
                            className="text-xs h-7 px-2 text-blue-900 hover:bg-blue-50"
                            title="Buka Pratinjau Dual-Mode"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            <span>Preview</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(q)}
                            className="text-xs h-7 px-2 text-slate-700"
                            title="Edit Butir Soal"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(q.id, q.active)}
                            className="text-xs h-7 px-2 text-slate-500 hover:text-slate-900"
                          >
                            {q.active ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTargetQuestion(q)}
                            className="text-xs h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Hapus Butir Soal"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            <span>Hapus</span>
                          </Button>
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

      {/* Dual Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-blue-900" />
                  <span>Pratinjau Butir Soal ({previewQuestion.id})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Uji keterbacaan visual dan transparansi kunci jawaban
                </p>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-center bg-slate-100 p-1 rounded-xl mb-5 space-x-1">
              <button
                type="button"
                onClick={() => setPreviewMode("user")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  previewMode === "user"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tampilan Kandidat (Preview as User)
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("key")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  previewMode === "key"
                    ? "bg-emerald-700 text-white shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tampilan Kunci Jawaban (Preview with Key)
              </button>
            </div>

            {/* Question Renderer in preview mode */}
            <QuestionRenderer
              question={previewQuestion}
              questionIndex={0}
              totalQuestionsInModule={1}
              selectedAnswer={previewSelectedAnswer}
              onSelectAnswer={(ans) => setPreviewSelectedAnswer(ans)}
              previewWithKey={previewMode === "key"}
            />

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" onClick={() => setPreviewQuestion(null)} className="text-xs">
                Tutup Pratinjau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Question Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingQuestionId ? `Edit Butir Soal (${editingQuestionId})` : "Tambah Butir Soal Baru"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingQuestionId
                    ? "Setiap pembaruan akan membuat snapshot versi baru di QuestionVersion secara otomatis."
                    : "Lengkapi data teks, stimulus visual, dan kunci jawaban dengan penjelasan."}
                </p>
              </div>
              <button onClick={() => setShowFormModal(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              {editingQuestionId && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                  <label className="font-bold text-blue-950 block mb-1">
                    Alasan Perubahan / Catatan Revisi:
                  </label>
                  <input
                    type="text"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="Contoh: Memperbaiki ketidakjelasan gambar opsi C dan memperjelas penjelasan..."
                    className="w-full p-2 text-xs bg-white border border-blue-300 rounded focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Domain</label>
                  <select
                    value={qDomain}
                    onChange={(e) => setQDomain(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  >
                    {Object.entries(DOMAIN_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tingkat Kesulitan</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HARD">HARD</option>
                    <option value="VERY_HARD">VERY_HARD</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Kualitas</label>
                  <select
                    value={qQualityStatus}
                    onChange={(e) => setQQualityStatus(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE (Siap Diujikan)</option>
                    <option value="REVIEW_REQUIRED">REVIEW_REQUIRED (Perlu Tinjauan)</option>
                    <option value="DRAFT">DRAFT (Konsep)</option>
                    <option value="DEPRECATED">DEPRECATED (Diarsipkan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teks Pertanyaan (Prompt)</label>
                <textarea
                  rows={3}
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  placeholder="Masukkan kalimat soal dengan jelas..."
                  className="w-full p-2 border rounded border-slate-300"
                  required
                />
              </div>

              {/* Question Image Stimulus Upload */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-1.5 text-blue-900" />
                    <span>Gambar Stimulus Soal (Opsional)</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500">Posisi Gambar:</span>
                    <select
                      value={qImagePos}
                      onChange={(e) => setQImagePos(e.target.value as any)}
                      className="p-1 border rounded text-[11px] bg-white border-slate-300"
                    >
                      <option value="ABOVE_QUESTION">Di Atas Teks (Above)</option>
                      <option value="BELOW_QUESTION">Di Bawah Teks (Below)</option>
                      <option value="INLINE">Sejajar Teks (Inline)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0], "prompt");
                      }
                    }}
                    className="text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400">atau URL:</span>
                  <input
                    type="text"
                    value={qImageUrl}
                    onChange={(e) => setQImageUrl(e.target.value)}
                    placeholder="/uploads/questions/... atau https://..."
                    className="flex-1 p-1.5 border rounded border-slate-300 text-xs"
                  />
                  {qImageUrl && (
                    <button
                      type="button"
                      onClick={() => setQImageUrl("")}
                      className="text-rose-600 hover:underline text-[11px]"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {qImageUrl && (
                  <div className="mt-2 p-2 bg-white rounded border border-slate-200 inline-block">
                    <img src={qImageUrl} alt="Preview Stimulus" className="max-h-32 rounded object-contain" />
                  </div>
                )}
              </div>

              {/* Options Section */}
              <div className="space-y-3">
                <div className="font-bold text-slate-800">Pilihan Jawaban (Minimal A & B)</div>

                {/* Option A */}
                <div className="p-3 border rounded-xl border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Opsi A</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "optA");
                      }}
                      className="text-[10px] text-slate-500 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-slate-100"
                    />
                  </div>
                  <input
                    type="text"
                    value={qOptionA}
                    onChange={(e) => setQOptionA(e.target.value)}
                    placeholder="Teks Opsi A..."
                    className="w-full p-2 border rounded border-slate-300"
                  />
                  {qOptionAImage && (
                    <div className="flex items-center space-x-2">
                      <img src={qOptionAImage} alt="Opsi A" className="h-10 rounded border" />
                      <button type="button" onClick={() => setQOptionAImage("")} className="text-rose-600 text-[10px]">
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>

                {/* Option B */}
                <div className="p-3 border rounded-xl border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Opsi B</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "optB");
                      }}
                      className="text-[10px] text-slate-500 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-slate-100"
                    />
                  </div>
                  <input
                    type="text"
                    value={qOptionB}
                    onChange={(e) => setQOptionB(e.target.value)}
                    placeholder="Teks Opsi B..."
                    className="w-full p-2 border rounded border-slate-300"
                  />
                  {qOptionBImage && (
                    <div className="flex items-center space-x-2">
                      <img src={qOptionBImage} alt="Opsi B" className="h-10 rounded border" />
                      <button type="button" onClick={() => setQOptionBImage("")} className="text-rose-600 text-[10px]">
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>

                {/* Option C */}
                <div className="p-3 border rounded-xl border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Opsi C</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "optC");
                      }}
                      className="text-[10px] text-slate-500 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-slate-100"
                    />
                  </div>
                  <input
                    type="text"
                    value={qOptionC}
                    onChange={(e) => setQOptionC(e.target.value)}
                    placeholder="Teks Opsi C (Opsional)..."
                    className="w-full p-2 border rounded border-slate-300"
                  />
                  {qOptionCImage && (
                    <div className="flex items-center space-x-2">
                      <img src={qOptionCImage} alt="Opsi C" className="h-10 rounded border" />
                      <button type="button" onClick={() => setQOptionCImage("")} className="text-rose-600 text-[10px]">
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>

                {/* Option D */}
                <div className="p-3 border rounded-xl border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Opsi D</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "optD");
                      }}
                      className="text-[10px] text-slate-500 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-slate-100"
                    />
                  </div>
                  <input
                    type="text"
                    value={qOptionD}
                    onChange={(e) => setQOptionD(e.target.value)}
                    placeholder="Teks Opsi D (Opsional)..."
                    className="w-full p-2 border rounded border-slate-300"
                  />
                  {qOptionDImage && (
                    <div className="flex items-center space-x-2">
                      <img src={qOptionDImage} alt="Opsi D" className="h-10 rounded border" />
                      <button type="button" onClick={() => setQOptionDImage("")} className="text-rose-600 text-[10px]">
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Answer Key & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kunci Jawaban Tepat</label>
                  <select
                    value={qCorrectAnswer}
                    onChange={(e) => setQCorrectAnswer(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300 font-bold text-blue-900"
                  >
                    <option value="A">Opsi A</option>
                    <option value="B">Opsi B</option>
                    <option value="C">Opsi C</option>
                    <option value="D">Opsi D</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Strategi Eliminasi / Pacing</label>
                  <input
                    type="text"
                    value={qSolvingStrategy}
                    onChange={(e) => setQSolvingStrategy(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                    placeholder="Tips eliminasi cepat..."
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Penjelasan Solusi Transparan <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                  placeholder="Jelaskan langkah logis pembuktian jawaban secara objektif..."
                  required={qQualityStatus === "ACTIVE"}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowFormModal(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUploadingImage}
                  className="bg-blue-900 hover:bg-blue-800 font-bold text-white"
                >
                  {isUploadingImage ? "Mengunggah..." : editingQuestionId ? "Simpan Revisi Versi" : "Simpan Butir Soal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      {/* Delete Question Confirmation Modal */}
      {deleteTargetQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-base">
                <Trash2 className="h-5 w-5 text-rose-600" />
                <h3>Hapus Butir Soal</h3>
              </div>
              <button
                onClick={() => setDeleteTargetQuestion(null)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <p>
                Apakah Anda yakin ingin menghapus butir soal berikut secara permanen dari bank soal?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono text-[11px] text-slate-800">
                <div><span className="text-slate-500 font-sans">ID:</span> <strong>{deleteTargetQuestion.id}</strong></div>
                <div><span className="text-slate-500 font-sans">Domain:</span> <strong>{DOMAIN_LABELS[deleteTargetQuestion.domain] || deleteTargetQuestion.domain}</strong></div>
                <div><span className="text-slate-500 font-sans">Subtopik:</span> {deleteTargetQuestion.subtopic || "-"}</div>
                <div><span className="text-slate-500 font-sans">Kunci Jawaban:</span> <span className="font-bold text-emerald-700">{deleteTargetQuestion.correctAnswer}</span></div>
                <div className="line-clamp-2 pt-1 font-sans text-slate-700 italic border-t border-slate-200">
                  &quot;{deleteTargetQuestion.prompt}&quot;
                </div>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] leading-relaxed flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Peringatan:</strong> Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Riwayat versi, laporan butir soal, dan rekaman pengujian yang berkaitan dengan butir soal ini akan dihapus dari sistem.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteTargetQuestion(null)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteQuestion}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Soal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
