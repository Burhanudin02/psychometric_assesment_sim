"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Flag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  BookOpen,
  Users,
  Eye,
  Edit,
  ExternalLink,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";
import { DOMAIN_LABELS } from "@/lib/curriculum";

interface ReportItem {
  id: string;
  questionId: string;
  questionVersion: number;
  reason: string;
  comment: string | null;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED" | "DUPLICATE";
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  adminNote: string | null;
  question: {
    id: string;
    domain: string;
    subtopic: string;
    questionType: string;
    qualityStatus: "DRAFT" | "ACTIVE" | "REVIEW_REQUIRED" | "DEPRECATED";
    prompt: string;
    image?: string | null;
    imagePosition?: string;
    svgData?: string | null;
    options: any;
    correctAnswer: string;
    explanation: string;
    reportCount: number;
    version: number;
  };
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
  };
}

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  AMBIGUOUS_MULTIPLE_ANSWERS: { label: "Ambigu / Multi-Tafsir", color: "bg-amber-100 text-amber-900 border-amber-200" },
  IMAGE_UNCLEAR: { label: "Gambar Tidak Jelas", color: "bg-orange-100 text-orange-900 border-orange-200" },
  INCORRECT_ANSWER_KEY: { label: "Kunci Jawaban Salah", color: "bg-rose-100 text-rose-900 border-rose-200" },
  QUESTION_INCOMPLETE: { label: "Soal Terpotong", color: "bg-purple-100 text-purple-900 border-purple-200" },
  BROKEN_IMAGE: { label: "Gambar Rusak", color: "bg-red-100 text-red-900 border-red-200" },
  TYPO_FORMATTING: { label: "Typo / Format", color: "bg-blue-100 text-blue-900 border-blue-200" },
  OTHER: { label: "Lainnya", color: "bg-slate-100 text-slate-900 border-slate-200" },
};

export default function AdminQuestionReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reports?status=${selectedStatus}&domain=${selectedDomain}`
      );
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedStatus, selectedDomain]);

  const handleUpdateStatus = async (
    reportId: string,
    newStatus: string,
    updateQuestionStatus?: string
  ) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status: newStatus,
          updateQuestionStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Status laporan diperbarui ke ${newStatus}.`);
        loadReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async (reportId: string) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          adminNote: noteValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Catatan administrator berhasil disimpan.");
        setEditingNoteId(null);
        loadReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = reports.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.questionId.toLowerCase().includes(term) ||
      (r.comment && r.comment.toLowerCase().includes(term)) ||
      r.question.prompt.toLowerCase().includes(term)
    );
  });

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
              <Flag className="h-4 w-4 mr-1.5 text-rose-600" />
              <span>Laporan & Evaluasi Kualitas Soal</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <BetaBadge />
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
            className="py-3 text-blue-900 border-b-2 border-blue-900 font-bold flex items-center space-x-1.5"
          >
            <Flag className="h-3.5 w-3.5 text-rose-600" />
            <span>Laporan Soal ({summary.open ?? 0} Baru)</span>
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

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Total Laporan</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{summary.total || 0}</div>
          </div>
          <div className="bg-white border border-rose-200 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] text-rose-600 font-bold">Laporan Baru (Open)</div>
            <div className="text-xl font-extrabold text-rose-700 mt-1">{summary.open || 0}</div>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] text-amber-700 font-medium">Sedang Ditinjau</div>
            <div className="text-xl font-extrabold text-amber-800 mt-1">{summary.inReview || 0}</div>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] text-emerald-700 font-medium">Terselesaikan</div>
            <div className="text-xl font-extrabold text-emerald-800 mt-1">{summary.resolved || 0}</div>
          </div>
          <div className="bg-white border border-purple-200 rounded-xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
            <div className="text-[11px] text-purple-700 font-bold">Butir Review Required</div>
            <div className="text-xl font-extrabold text-purple-900 mt-1">
              {summary.reviewRequiredQuestions || 0}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="OPEN">OPEN (Baru)</option>
                <option value="IN_REVIEW">IN_REVIEW (Sedang Ditinjau)</option>
                <option value="RESOLVED">RESOLVED (Terselesaikan)</option>
                <option value="DISMISSED">DISMISSED (Ditolak)</option>
                <option value="DUPLICATE">DUPLICATE (Duplikat)</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500">Domain:</span>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">Semua Domain</option>
                {Object.entries(DOMAIN_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID soal atau isi komentar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Memuat data laporan soal...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Tidak ada laporan soal yang ditemukan untuk filter ini.
            </div>
          ) : (
            filtered.map((r) => {
              const reasonInfo = REASON_LABELS[r.reason] || { label: r.reason, color: "bg-slate-100 text-slate-800" };
              const q = r.question;

              return (
                <div
                  key={r.id}
                  className={`bg-white rounded-xl border transition-shadow shadow-xs p-5 space-y-4 ${
                    r.status === "OPEN" ? "border-rose-300 bg-rose-50/10" : "border-slate-200"
                  }`}
                >
                  {/* Top line of report item */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${reasonInfo.color}`}>
                        {reasonInfo.label}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {q.id}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({DOMAIN_LABELS[q.domain] || q.domain} · v{r.questionVersion})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.qualityStatus === "REVIEW_REQUIRED"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : q.qualityStatus === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        Status Soal: {q.qualityStatus}
                      </span>
                      {q.reportCount >= 3 && (
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
                          {q.reportCount}x Dilaporkan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span>Dilaporkan oleh: <strong>{r.user.displayName || r.user.email || "Kandidat"}</strong></span>
                      <span>·</span>
                      <span>{new Date(r.createdAt).toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {/* Body: Candidate comment & Question details */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Report reason & candidate comment */}
                    <div className="lg:col-span-4 bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center">
                        <MessageSquare className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        <span>Komentar Kandidat:</span>
                      </div>
                      <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded border border-slate-200">
                        {r.comment ? `"${r.comment}"` : "Tidak ada komentar tambahan dari kandidat."}
                      </p>

                      {/* Admin Note Section */}
                      <div className="pt-2 border-t border-slate-200/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-700">Catatan Admin:</span>
                          {editingNoteId !== r.id && (
                            <button
                              onClick={() => {
                                setEditingNoteId(r.id);
                                setNoteValue(r.adminNote || "");
                              }}
                              className="text-[10px] text-blue-900 font-semibold hover:underline"
                            >
                              {r.adminNote ? "Ubah" : "+ Tambah Catatan"}
                            </button>
                          )}
                        </div>

                        {editingNoteId === r.id ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={noteValue}
                              onChange={(e) => setNoteValue(e.target.value)}
                              placeholder="Tulis resolusi atau tindakan yang diambil..."
                              className="w-full text-xs p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                            />
                            <div className="flex justify-end space-x-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingNoteId(null)}
                                className="h-6 px-2 text-[10px]"
                              >
                                Batal
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(r.id)}
                                className="h-6 px-2 text-[10px] bg-blue-900 text-white"
                              >
                                Simpan Catatan
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-600">
                            {r.adminNote || <span className="text-slate-400">Belum ada catatan penyelesaian.</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Question Prompt, Image, Options & Answer Key */}
                    <div className="lg:col-span-8 space-y-2.5">
                      <div className="text-xs font-semibold text-slate-900">
                        {q.prompt}
                      </div>

                      {/* Visual stimulus if any */}
                      {q.image && (
                        <div className="my-2 p-2 bg-slate-100 rounded-lg border border-slate-200 inline-block max-w-sm">
                          <img
                            src={q.image}
                            alt="Stimulus Soal"
                            className="max-h-40 rounded object-contain"
                          />
                        </div>
                      )}

                      {/* SVG Stimulus if any */}
                      {q.svgData && (
                        <div
                          className="my-2 p-3 bg-slate-100 rounded-lg border border-slate-200 max-w-md"
                          dangerouslySetInnerHTML={{ __html: q.svgData }}
                        />
                      )}

                      {/* Options Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {(q.options as any[]).map((opt) => {
                          const isCorrect = opt.id === q.correctAnswer;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded border flex items-center space-x-2 ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                  : "bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                            >
                              <span className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px]">
                                {opt.id}
                              </span>
                              <span className="truncate">{opt.text || (opt.image ? "[Gambar Opsi]" : "")}</span>
                              {isCorrect && (
                                <span className="ml-auto text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                                  Kunci
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        <strong className="text-slate-800">Penjelasan:</strong> {q.explanation}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer for this report */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-slate-500 font-medium">Ubah Status Laporan:</span>
                      <Button
                        size="sm"
                        variant={r.status === "IN_REVIEW" ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(r.id, "IN_REVIEW")}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        In Review
                      </Button>
                      <Button
                        size="sm"
                        variant={r.status === "RESOLVED" ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(r.id, "RESOLVED", "ACTIVE")}
                        className="h-7 px-2.5 text-[11px] text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        Selesaikan & Aktifkan
                      </Button>
                      <Button
                        size="sm"
                        variant={r.status === "DISMISSED" ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(r.id, "DISMISSED")}
                        className="h-7 px-2.5 text-[11px] text-slate-600 hover:bg-slate-100"
                      >
                        Tolak Laporan
                      </Button>
                      <Button
                        size="sm"
                        variant={r.status === "DUPLICATE" ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(r.id, "DUPLICATE")}
                        className="h-7 px-2.5 text-[11px] text-slate-600 hover:bg-slate-100"
                      >
                        Tandai Duplikat
                      </Button>
                    </div>

                    <Link href={`/admin?search=${encodeURIComponent(q.id)}`}>
                      <Button size="sm" variant="outline" className="h-7 px-3 text-xs font-semibold text-blue-900 border-blue-300 hover:bg-blue-50">
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        <span>Edit Butir Soal Ini</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
