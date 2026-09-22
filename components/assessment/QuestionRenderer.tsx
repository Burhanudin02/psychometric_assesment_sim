"use client";

import React, { useState } from "react";
import { Flag, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { QuestionItem } from "@/features/questions/types";
import { ReportQuestionModal } from "./ReportQuestionModal";

interface QuestionRendererProps {
  question: QuestionItem;
  questionIndex: number;
  totalQuestionsInModule: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
  disabled?: boolean;
  sessionId?: string;
  anonymousToken?: string;
  previewWithKey?: boolean;
  showExplanation?: boolean;
}

export function QuestionRenderer({
  question,
  questionIndex,
  totalQuestionsInModule,
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
  sessionId,
  anonymousToken,
  previewWithKey = false,
  showExplanation = false,
}: QuestionRendererProps) {
  const [showReportModal, setShowReportModal] = useState(false);

  const imagePos = question.imagePosition || "ABOVE_QUESTION";

  const renderPromptImage = () => {
    if (!question.image) return null;
    return (
      <div className="my-3 flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50/80 overflow-hidden">
        <img
          src={question.image}
          alt="Stimulus Soal"
          className="max-h-64 sm:max-h-80 w-auto rounded object-contain"
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-all relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded">
            Soal {questionIndex + 1} dari {totalQuestionsInModule}
          </span>
          {question.version && question.version > 1 && (
            <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              v{question.version}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            ID: {question.id}
          </span>

          {/* Report Button (Disabled in authoring preview) */}
          {!previewWithKey && (
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 cursor-pointer"
              title="Laporkan kendala atau kebingungan pada soal ini"
            >
              <Flag className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Laporkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Image if positioned ABOVE_QUESTION */}
      {imagePos === "ABOVE_QUESTION" && renderPromptImage()}

      {/* Prompt */}
      <div className="text-slate-900 font-medium text-base sm:text-lg leading-relaxed whitespace-pre-line mb-4">
        {question.prompt}
      </div>

      {/* Image if positioned BELOW_QUESTION or INLINE */}
      {(imagePos === "BELOW_QUESTION" || imagePos === "INLINE") && renderPromptImage()}

      {/* Embedded SVG Graphic if present */}
      {question.svgData && (
        <div
          className="my-4 flex items-center justify-center p-4 rounded-lg border border-slate-200 bg-slate-50/50 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: question.svgData }}
        />
      )}

      {/* Options */}
      {(() => {
        const hasVisualOptions = question.options.some((opt) => !!opt.svg || !!opt.image);

        return (
          <div
            className={
              hasVisualOptions
                ? "grid grid-cols-2 gap-3 sm:gap-4 mt-5"
                : "space-y-3 mt-5"
            }
            role="radiogroup"
            aria-label={`Pilihan jawaban untuk soal ${questionIndex + 1}`}
          >
            {question.options.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              const isCorrect = previewWithKey && question.correctAnswer === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectAnswer(opt.id)}
                  aria-label={opt.altText || `Pilihan ${opt.id}`}
                  className={`w-full text-left rounded-xl border text-sm sm:text-base transition-all select-none cursor-pointer ${
                    hasVisualOptions
                      ? "flex flex-col items-center justify-center p-3 relative hover:shadow-xs"
                      : "flex items-start space-x-3.5 p-3.5"
                  } ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/40 shadow-xs"
                      : isSelected
                      ? "border-blue-700 bg-blue-50/80 text-blue-950 font-semibold ring-2 ring-blue-600/30 shadow-xs"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/60"
                  } ${disabled ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {/* Option Letter Tag */}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      hasVisualOptions ? "absolute top-2 left-2" : ""
                    } ${
                      isCorrect
                        ? "bg-emerald-600 text-white"
                        : isSelected
                        ? "bg-blue-800 text-white"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {opt.id}
                  </span>

                  {/* Option Text / Image / SVG */}
                  <div
                    className={
                      hasVisualOptions
                        ? "w-full flex flex-col items-center justify-center pt-5 pb-1"
                        : "flex-1 pt-0.5 leading-snug space-y-2"
                    }
                  >
                    {opt.text && (
                      <div className={hasVisualOptions ? "text-xs text-center font-medium mt-1" : ""}>
                        {opt.text}
                      </div>
                    )}
                    {opt.image && (
                      <div className="p-1 bg-slate-50 rounded border border-slate-200 inline-block">
                        <img
                          src={opt.image}
                          alt={opt.altText || `Opsi ${opt.id}`}
                          className="max-h-24 sm:max-h-28 w-auto rounded object-contain"
                        />
                      </div>
                    )}
                    {opt.svg && (
                      <div
                        className="flex items-center justify-center w-full max-w-[140px] aspect-square"
                        dangerouslySetInnerHTML={{ __html: opt.svg }}
                      />
                    )}
                  </div>

                  {isCorrect && (
                    <span
                      className={`text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center ${
                        hasVisualOptions ? "absolute top-2 right-2" : "shrink-0 ml-2"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Kunci
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Answer Key & Explanation Box (in preview or review mode) */}
      {(previewWithKey || showExplanation) && (question.explanation || question.rule) && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
            <Info className="h-4 w-4 text-emerald-700" />
            <span>Kunci Jawaban & Penjelasan Resmi:</span>
          </div>

          {question.rule && (
            <div className="text-xs text-emerald-950">
              <strong>Aturan Geometri:</strong> {question.rule}
            </div>
          )}

          {question.explanation && (
            <p className="text-xs text-emerald-950 leading-relaxed">
              {question.explanation}
            </p>
          )}

          {question.solvingStrategy && (
            <div className="pt-2 border-t border-emerald-200/70 text-[11px] text-emerald-900 flex items-start space-x-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Strategi Cepat:</strong> {question.solvingStrategy}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportQuestionModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        questionId={question.id}
        questionVersion={question.version || 1}
        sessionId={sessionId}
        anonymousToken={anonymousToken}
      />
    </div>
  );
}
