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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOMAIN_LABELS } from "@/lib/curriculum";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // New question form modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQDomain, setNewQDomain] = useState("NUMERICAL_REASONING");
  const [newQSubtopic, setNewQSubtopic] = useState("percentages");
  const [newQDifficulty, setNewQDifficulty] = useState("MODERATE");
  const [newQPrompt, setNewQPrompt] = useState("");
  const [newQOptionA, setNewQOptionA] = useState("");
  const [newQOptionB, setNewQOptionB] = useState("");
  const [newQOptionC, setNewQOptionC] = useState("");
  const [newQOptionD, setNewQOptionD] = useState("");
  const [newQCorrectAnswer, setNewQCorrectAnswer] = useState("A");
  const [newQExplanation, setNewQExplanation] = useState("");
  const [newQSolvingStrategy, setNewQSolvingStrategy] = useState("");

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?domain=${selectedDomain}`);
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
  }, [selectedDomain]);

  const handleExportJson = () => {
    window.open("/api/admin/export", "_blank");
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQPrompt || !newQOptionA || !newQOptionB) {
      alert("Harap isi soal dan minimal Opsi A & B.");
      return;
    }

    const payload = {
      domain: newQDomain,
      subtopic: newQSubtopic,
      questionType: "TEXT_MCQ",
      difficulty: newQDifficulty,
      prompt: newQPrompt,
      options: [
        { id: "A", text: newQOptionA },
        { id: "B", text: newQOptionB },
        { id: "C", text: newQOptionC },
        { id: "D", text: newQOptionD },
      ].filter((o) => Boolean(o.text)),
      correctAnswer: newQCorrectAnswer,
      explanation: newQExplanation,
      solvingStrategy: newQSolvingStrategy,
      tags: ["admin_created", newQSubtopic],
    };

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Soal baru berhasil ditambahkan!");
        setShowCreateModal(false);
        // Reset form
        setNewQPrompt("");
        setNewQOptionA("");
        setNewQOptionB("");
        setNewQOptionC("");
        setNewQOptionD("");
        setNewQExplanation("");
        setNewQSolvingStrategy("");
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, active: !currentActive } : q))
        );
      }
    } catch (err) {
      console.error(err);
    }
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
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={handleExportJson} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />
              <span>Ekspor JSON</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-900 hover:bg-blue-800 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Tambah Soal</span>
            </Button>
          </div>
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

        {/* Filters Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
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
                  <th className="py-3 px-3">Teks Soal</th>
                  <th className="py-3 px-3 text-center">Kunci</th>
                  <th className="py-3 px-3 text-center">Kesulitan</th>
                  <th className="py-3 px-3 text-center">Statistik (Percobaan / Akurasi)</th>
                  <th className="py-3 px-3 text-center">Status</th>
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
                    const stats = q.stats || { attempts: 0, accuracy: 0, avgResponseTimeSec: 0 };
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-900 block">{q.id}</span>
                          <span className="text-[10px] text-slate-500">
                            {DOMAIN_LABELS[q.domain] || q.domain}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-md">
                          <p className="line-clamp-2 text-slate-800 leading-snug">
                            {q.prompt}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-blue-900">
                          {q.correctAnswer}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-semibold text-slate-800 block">
                            {stats.attempts}x | {stats.accuracy}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Rata-rata: {stats.avgResponseTimeSec}s
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {q.active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(q.id, q.active)}
                            className="text-xs h-7 px-2 text-slate-600 hover:text-slate-900"
                          >
                            {q.active ? "Nonaktifkan" : "Aktifkan"}
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

      {/* Create Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Tambah Butir Soal Baru</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Domain</label>
                  <select
                    value={newQDomain}
                    onChange={(e) => setNewQDomain(e.target.value)}
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
                    value={newQDifficulty}
                    onChange={(e) => setNewQDifficulty(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teks Pertanyaan (Prompt)</label>
                <textarea
                  rows={3}
                  value={newQPrompt}
                  onChange={(e) => setNewQPrompt(e.target.value)}
                  placeholder="Masukkan kalimat soal..."
                  className="w-full p-2 border rounded border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opsi A</label>
                  <input
                    type="text"
                    value={newQOptionA}
                    onChange={(e) => setNewQOptionA(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opsi B</label>
                  <input
                    type="text"
                    value={newQOptionB}
                    onChange={(e) => setNewQOptionB(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opsi C</label>
                  <input
                    type="text"
                    value={newQOptionC}
                    onChange={(e) => setNewQOptionC(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opsi D</label>
                  <input
                    type="text"
                    value={newQOptionD}
                    onChange={(e) => setNewQOptionD(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kunci Jawaban Tepat</label>
                <select
                  value={newQCorrectAnswer}
                  onChange={(e) => setNewQCorrectAnswer(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                >
                  <option value="A">Opsi A</option>
                  <option value="B">Opsi B</option>
                  <option value="C">Opsi C</option>
                  <option value="D">Opsi D</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Penjelasan Solusi</label>
                <textarea
                  rows={2}
                  value={newQExplanation}
                  onChange={(e) => setNewQExplanation(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                  placeholder="Penjelasan runtut..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Strategi Waktu Singkat</label>
                <input
                  type="text"
                  value={newQSolvingStrategy}
                  onChange={(e) => setNewQSolvingStrategy(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                  placeholder="Tips eliminasi..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-blue-900 hover:bg-blue-800 font-bold">
                  Simpan Butir Soal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
