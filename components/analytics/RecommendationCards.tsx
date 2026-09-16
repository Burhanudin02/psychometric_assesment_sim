"use client";

import React from "react";
import Link from "next/link";
import { TrainingRecommendation } from "@/features/review/trainingAdvisor";
import { ArrowRight, BookOpen, Flame, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecommendationCardsProps {
  recommendations: TrainingRecommendation[];
}

export function RecommendationCards({ recommendations }: RecommendationCardsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="border-b border-slate-100 pb-3 mb-5">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Rekomendasi Latihan Terarah (Actionable Training Recommendations)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Program latihan yang dipersonalisasi dari data objektif performa simulasi Anda.
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const priorityStyles = {
            HIGH: "border-red-200 bg-red-50/40 text-red-900",
            MEDIUM: "border-amber-200 bg-amber-50/40 text-amber-900",
            LOW: "border-blue-200 bg-blue-50/40 text-blue-900",
          }[rec.priority];

          return (
            <div
              key={rec.id}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityStyles}`}
                  >
                    Prioritas {rec.priority}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {rec.actionableDrill}
                </p>
                <p className="text-[11px] text-slate-500">
                  {rec.reasoning}
                </p>
              </div>

              <Link href={rec.drillUrl} className="shrink-0 w-full sm:w-auto">
                <Button size="sm" className="w-full bg-blue-900 hover:bg-blue-800 text-xs font-semibold">
                  <span>Mulai Drill</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
