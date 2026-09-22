import React from "react";
import { PerformanceDropInfo, LateRecoveryInfo } from "@/features/scoring/pacingMetrics";
import { AlertTriangle, Sparkles, TrendingUp, Info } from "lucide-react";

interface PacingDropRecoveryBannerProps {
  largestDrop: PerformanceDropInfo | null;
  recovery: LateRecoveryInfo | null;
  insights: string[];
}

export function PacingDropRecoveryBanner({
  largestDrop,
  recovery,
  insights,
}: PacingDropRecoveryBannerProps) {
  return (
    <div className="space-y-3">
      {/* Drop Alert */}
      {largestDrop && (
        <div className="flex items-start space-x-3 rounded-lg border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900">
          <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold">
              Penurunan Performa Tertajam: {largestDrop.fromTitle} → {largestDrop.toTitle}
            </span>
            <p className="text-slate-700 leading-relaxed">{largestDrop.description}</p>
          </div>
        </div>
      )}

      {/* Recovery Alert */}
      {recovery && recovery.hasRecovered && (
        <div className="flex items-start space-x-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900">
          <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold">Pemulihan Konsentrasi (Late Recovery Rebound)</span>
            <p className="text-slate-700 leading-relaxed">{recovery.description}</p>
          </div>
        </div>
      )}

      {/* Automated Cognitive Insights */}
      {insights.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Wawasan Analisis Pacing Otomatis</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
            {insights.map((insight, idx) => (
              <li key={idx} className="leading-relaxed">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
