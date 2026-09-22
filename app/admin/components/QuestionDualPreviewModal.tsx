import React, { useState } from "react";
import { X, BookOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";
import { QuestionItem } from "@/features/questions/types";

interface QuestionDualPreviewModalProps {
  question: QuestionItem | null;
  onClose: () => void;
}

export function QuestionDualPreviewModal({
  question,
  onClose,
}: QuestionDualPreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<"user" | "key">("user");
  const [previewSelectedAnswer, setPreviewSelectedAnswer] = useState<string | null>(null);

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-2xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {question.id}
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Pratinjau Butir Soal (v{question.version || 1})
            </h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Dual Mode Switcher Bar */}
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-semibold">Tampilan:</span>
            <div className="flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-300">
              <button
                type="button"
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  previewMode === "user"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setPreviewMode("user")}
              >
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1.5" />
                  Mode Peserta
                </span>
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  previewMode === "key"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setPreviewMode("key")}
              >
                <span className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1.5" />
                  Mode Kunci Jawaban (Admin)
                </span>
              </button>
            </div>
          </div>

          <span className="text-[11px] text-slate-500">
            {previewMode === "user"
              ? "Kunci jawaban & pembahasan disembunyikan"
              : "Kunci jawaban & strategi solusi ditampilkan"}
          </span>
        </div>

        {/* Question Renderer Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <QuestionRenderer
            question={question}
            questionNumber={1}
            selectedOptionId={previewSelectedAnswer}
            onSelectOption={(optId) => setPreviewSelectedAnswer(optId)}
            showFeedback={previewMode === "key"}
          />
        </div>
      </div>
    </div>
  );
}
