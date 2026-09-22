import React from "react";
import { QuestionItem } from "@/features/questions/types";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";
import { ModuleProgressSidebar } from "@/components/assessment/ModuleProgressSidebar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface SimulationModuleViewProps {
  currentModuleNum: number;
  totalModules: number;
  moduleTitle: string;
  moduleInstructions: string;
  questions: QuestionItem[];
  selectedAnswers: Record<string, string>;
  isSubmitting: boolean;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onSubmitModule: () => void;
  sessionId?: string;
}

export function SimulationModuleView({
  currentModuleNum,
  totalModules,
  moduleTitle,
  moduleInstructions,
  questions,
  selectedAnswers,
  isSubmitting,
  onSelectAnswer,
  onSubmitModule,
  sessionId,
}: SimulationModuleViewProps) {
  const isFinalModule = currentModuleNum === totalModules;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Module Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Module Instructions Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-900 mb-1">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>Petunjuk Pengerjaan Subtes</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {moduleInstructions}
            </p>
          </div>

          {/* Question Items List */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <QuestionRenderer
                key={q.id}
                question={q}
                questionIndex={idx}
                totalQuestionsInModule={questions.length}
                selectedAnswer={selectedAnswers[q.id] || null}
                onSelectAnswer={(optId) => onSelectAnswer(q.id, optId)}
                disabled={isSubmitting}
                sessionId={sessionId}
              />
            ))}
          </div>

          {/* Module Submission Action Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {Object.keys(selectedAnswers).length} dari {questions.length}
              </span>{" "}
              soal terjawab pada modul ini.
            </div>

            <Button
              onClick={onSubmitModule}
              disabled={isSubmitting}
              className="bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs px-6 py-2.5 h-auto shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : isFinalModule ? (
                <>
                  <span>Selesaikan Asesmen</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  <span>Simpan & Modul Berikutnya</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Sidebar: 21 Modules Navigation Grid */}
        <div className="lg:col-span-1 sticky top-20">
          <ModuleProgressSidebar
            currentModuleNum={currentModuleNum}
            totalModules={totalModules}
          />
        </div>
      </div>
    </main>
  );
}

