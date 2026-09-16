"use client";

import React from "react";
import { QuestionItem } from "@/features/questions/types";

interface QuestionRendererProps {
  question: QuestionItem;
  questionIndex: number;
  totalQuestionsInModule: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  questionIndex,
  totalQuestionsInModule,
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
}: QuestionRendererProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs transition-all">
      {/* Header index */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded">
          Soal {questionIndex + 1} dari {totalQuestionsInModule}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          ID: {question.id}
        </span>
      </div>

      {/* Prompt */}
      <div className="text-slate-900 font-medium text-base sm:text-lg leading-relaxed whitespace-pre-line mb-5">
        {question.prompt}
      </div>

      {/* Optional SVG Graphic */}
      {question.svgData && (
        <div
          className="my-5 flex items-center justify-center p-4 rounded-md border border-slate-200 bg-slate-50/50 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: question.svgData }}
        />
      )}

      {/* Options */}
      <div className="space-y-3 mt-4" role="radiogroup" aria-label={`Pilihan jawaban untuk soal ${questionIndex + 1}`}>
        {question.options.map((opt) => {
          const isSelected = selectedAnswer === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAnswer(opt.id)}
              className={`w-full text-left flex items-start space-x-3.5 p-3.5 rounded-lg border text-sm sm:text-base transition-all select-none cursor-pointer ${
                isSelected
                  ? "border-blue-700 bg-blue-50/80 text-blue-950 font-semibold ring-2 ring-blue-600/30 shadow-xs"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/60"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {/* Option Letter Tag */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-blue-800 text-white"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {opt.id}
              </span>

              {/* Option Text / SVG */}
              <div className="flex-1 pt-0.5 leading-snug">
                {opt.text && <span>{opt.text}</span>}
                {opt.svg && (
                  <div
                    className="mt-1"
                    dangerouslySetInnerHTML={{ __html: opt.svg }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
