import React, { useState } from "react";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportQuestionModal } from "@/components/assessment/ReportQuestionModal";
import { DOMAIN_LABELS } from "@/lib/curriculum";

interface QuestionReviewItem {
  questionId: string;
  moduleNumber: number;
  moduleTitle: string;
  domain: string;
  prompt: string;
  image?: string | null;
  svgData?: string | null;
  options: any;
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  isAnswered: boolean;
  responseTimeMs: number;
  isTimedOut: boolean;
  errorCategory: string;
  explanation: string;
  solvingStrategy?: string;
  version?: number;
}

interface QuestionReviewAccordionProps {
  questions: QuestionReviewItem[];
  sessionId: string;
}

export function QuestionReviewAccordion({
  questions,
  sessionId,
}: QuestionReviewAccordionProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "INCORRECT">("INCORRECT");
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [reportingQuestion, setReportingQuestion] = useState<{
    id: string;
    version: number;
  } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterMode === "INCORRECT") {
      return !q.isCorrect;
    }
    return true;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Kaji Ulang Transparansi Pembahasan & Kunci Jawaban
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periksa seluruh alasan kesalahan, kunci jawaban resmi, dan tips penyelesaian cepat.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 rounded-lg bg-slate-100 p-1 text-xs">
          <button
            type="button"
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              filterMode === "INCORRECT"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setFilterMode("INCORRECT")}
          >
            Hanya Salah / Lewat ({questions.filter((q) => !q.isCorrect).length})
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              filterMode === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setFilterMode("ALL")}
          >
            Semua Soal ({questions.length})
          </button>
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {filterMode === "INCORRECT"
              ? "Luar biasa! Tidak ada butir soal yang salah dalam asesmen ini."
              : "Tidak ada butir soal untuk ditampilkan."}
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = Boolean(expandedMap[q.questionId]);
            const domainLabel = DOMAIN_LABELS[q.domain] || q.domain;

            return (
              <div
                key={q.questionId}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
              >
                {/* Header Clickable Row */}
                <button
                  type="button"
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpand(q.questionId)}
                >
                  <div className="flex items-center space-x-3 flex-1 pr-4 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-400 w-6">
                      #{idx + 1}
                    </span>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                          Modul {String(q.moduleNumber).padStart(2, "0")} · {domainLabel}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {q.questionId}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {q.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="text-[11px] font-mono text-slate-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-slate-400" />
                      {(q.responseTimeMs / 1000).toFixed(1)}s
                    </span>

                    {q.isCorrect ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Benar
                      </span>
                    ) : q.isTimedOut && !q.isAnswered ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Kehabisan Waktu
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        <XCircle className="h-3 w-3 mr-1" /> Salah
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Review Body */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                    {/* Prompt & Stimulus */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-700">Pertanyaan Lengkap:</span>
                      <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-lg border border-slate-200">
                        {q.prompt}
                      </p>

                      {q.image && (
                        <div className="p-2 bg-white rounded-lg border border-slate-200 max-w-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={q.image}
                            alt="Stimulus Soal"
                            className="max-h-48 rounded object-contain"
                          />
                        </div>
                      )}

                      {q.svgData && (
                        <div
                          className="p-3 bg-white rounded-lg border border-slate-200 max-w-md"
                          dangerouslySetInnerHTML={{ __html: q.svgData }}
                        />
                      )}
                    </div>

                    {/* Choices Grid */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-700">Pilihan Jawaban:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.isArray(q.options) &&
                          q.options.map((opt: any) => {
                            const isSelected = q.selectedAnswer === opt.id;
                            const isCorrectAnswer = q.correctAnswer === opt.id;

                            let borderStyle = "border-slate-200 bg-white";
                            if (isCorrectAnswer) {
                              borderStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500";
                            } else if (isSelected && !isCorrectAnswer) {
                              borderStyle = "border-rose-400 bg-rose-50/70 text-rose-950";
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${borderStyle}`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold">{opt.id}.</span>
                                  <span>{opt.text || ""}</span>
                                  {opt.svg && (
                                    <div
                                      className="inline-block"
                                      dangerouslySetInnerHTML={{ __html: opt.svg }}
                                    />
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 text-[10px]">
                                  {isCorrectAnswer && (
                                    <span className="text-emerald-700 font-bold">Kunci Resmi</span>
                                  )}
                                  {isSelected && !isCorrectAnswer && (
                                    <span className="text-rose-700 font-bold">Jawaban Anda</span>
                                  )}
                                  {isSelected && isCorrectAnswer && (
                                    <span className="text-emerald-700 font-bold">Jawaban Anda ✓</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Explanation & Solving Strategy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                        <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
                          Pembahasan Solusi Transparan:
                        </span>
                        <p className="text-slate-700 leading-relaxed text-xs">
                          {q.explanation}
                        </p>
                      </div>

                      {q.solvingStrategy && (
                        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                          <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                            Tips Strategi Cepat:
                          </span>
                          <p className="text-slate-700 leading-relaxed text-xs">
                            {q.solvingStrategy}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Report button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setReportingQuestion({
                            id: q.questionId,
                            version: q.version || 1,
                          })
                        }
                        className="text-[11px] text-slate-500 hover:text-amber-700 h-7 px-2"
                      >
                        <Flag className="h-3 w-3 mr-1.5" />
                        <span>Laporkan Keraguan pada Soal Ini</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Question Report Modal */}
      {reportingQuestion && (
        <ReportQuestionModal
          questionId={reportingQuestion.id}
          questionVersion={reportingQuestion.version}
          sessionId={sessionId}
          onClose={() => setReportingQuestion(null)}
        />
      )}
    </div>
  );
}
