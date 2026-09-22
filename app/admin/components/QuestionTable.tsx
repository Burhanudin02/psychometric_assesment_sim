import React from "react";
import { Eye, Edit2, Trash2, ImageIcon, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOMAIN_LABELS } from "@/lib/curriculum";

interface QuestionTableProps {
  questions: any[];
  onOpenPreview: (q: any) => void;
  onOpenEdit: (q: any) => void;
  onOpenDelete: (q: any) => void;
}

export function QuestionTable({
  questions,
  onOpenPreview,
  onOpenEdit,
  onOpenDelete,
}: QuestionTableProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
        Tidak ditemukan butir soal yang sesuai dengan kriteria filter saat ini.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
              <th className="py-3 px-4">ID Soal</th>
              <th className="py-3 px-4">Domain & Subtopik</th>
              <th className="py-3 px-4 max-w-xs">Teks Soal / Stimulus</th>
              <th className="py-3 px-4">Kunci Jawaban</th>
              <th className="py-3 px-4">Status Mutu</th>
              <th className="py-3 px-4 text-right">Statistik Respon</th>
              <th className="py-3 px-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {questions.map((q) => {
              const quality = q.qualityStatus || (q.active ? "ACTIVE" : "DRAFT");
              const stats = q.stats || { attempts: 0, accuracy: 0, avgResponseTimeSec: 0, timeoutRate: 0 };

              return (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {q.id}
                    <div className="text-[10px] text-slate-400 font-normal">
                      v{q.version || 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">
                      {DOMAIN_LABELS[q.domain] || q.domain}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {q.subtopic || q.questionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="line-clamp-2 text-slate-800 leading-relaxed font-normal">
                      {q.prompt}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {q.image && (
                        <span className="inline-flex items-center text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          <ImageIcon className="h-2.5 w-2.5 mr-1" />
                          Gambar
                        </span>
                      )}
                      {q.svgData && (
                        <span className="inline-flex items-center text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          SVG Stimulus
                        </span>
                      )}
                      {q.reportCount > 0 && (
                        <span className="inline-flex items-center text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
                          <Flag className="h-2.5 w-2.5 mr-0.5 text-rose-600" />
                          {q.reportCount} Laporan
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900">
                      Opsi {q.correctAnswer}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {Array.isArray(q.options) ? `${q.options.length} opsi` : "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {quality === "ACTIVE" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ACTIVE
                      </span>
                    )}
                    {quality === "REVIEW_REQUIRED" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        REVIEW_REQUIRED
                      </span>
                    )}
                    {quality === "DRAFT" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        DRAFT
                      </span>
                    )}
                    {quality === "DEPRECATED" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        DEPRECATED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono text-slate-900 font-semibold">
                      {stats.accuracy}% akurasi
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {stats.attempts}x diuji · {stats.avgResponseTimeSec}s
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenPreview(q)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-blue-700"
                        title="Pratinjau Soal & Kunci Jawaban"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenEdit(q)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-amber-700"
                        title="Sunting Soal"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenDelete(q)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-rose-700"
                        title="Hapus Soal"
                      >
                        <Trash2 className="h-4 w-4" />
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
