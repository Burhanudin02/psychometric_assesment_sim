"use client";

import React from "react";
import { AlertTriangle, Clock, Zap, Target, HelpCircle } from "lucide-react";

export interface ErrorCountItem {
  category: string;
  label: string;
  count: number;
  description: string;
  remedyTip: string;
}

interface ErrorTaxonomyListProps {
  errors: ErrorCountItem[];
}

export function ErrorTaxonomyList({ errors }: ErrorTaxonomyListProps) {
  if (errors.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Luar biasa! Tidak ditemukan kesalahan signifikan dalam sesi ini.
      </div>
    );
  }

  const getIcon = (category: string) => {
    switch (category) {
      case "TIMEOUT_UNANSWERED":
        return <Clock className="h-5 w-5 text-red-500" />;
      case "CARELESS_RAPID_ERROR":
        return <Zap className="h-5 w-5 text-amber-500" />;
      case "ARITHMETIC_ERROR":
      case "PATTERN_MISRECOGNITION":
      case "SPATIAL_ORIENTATION_ERROR":
        return <Target className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Taksonomi Kesalahan Kognitif (Cognitive Error Taxonomy)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Klasifikasi pola kekeliruan agar Anda dapat melatih strategi spesifik untuk memperbaikinya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {errors.map((err) => (
          <div key={err.category} className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start space-x-3.5">
            <div className="p-2 rounded-md bg-white border border-slate-200 shrink-0">
              {getIcon(err.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-slate-900">{err.label}</h4>
                <span className="text-xs font-bold bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded-full">
                  {err.count}x
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                {err.description}
              </p>
              <div className="text-[11px] text-blue-900 bg-blue-50/80 p-2 rounded border border-blue-100 font-medium">
                <strong>Tips Solusi:</strong> {err.remedyTip}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
