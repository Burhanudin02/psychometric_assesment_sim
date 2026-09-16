"use client";

import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { getCurriculumBlueprint } from "@/lib/curriculum";

interface ModuleProgressSidebarProps {
  currentModuleNum: number;
  totalModules: number;
}

export function ModuleProgressSidebar({
  currentModuleNum,
  totalModules,
}: ModuleProgressSidebarProps) {
  const blueprint = getCurriculumBlueprint();

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50/50 p-4 hidden lg:flex lg:flex-col h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Progres 21 Subtes
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Modul berjalan otomatis saat waktu habis
        </p>
      </div>

      <div className="space-y-1 pr-1">
        {blueprint.slice(0, totalModules).map((m) => {
          const isCompleted = m.moduleNumber < currentModuleNum;
          const isCurrent = m.moduleNumber === currentModuleNum;
          const isUpcoming = m.moduleNumber > currentModuleNum;

          return (
            <div
              key={m.moduleNumber}
              className={`flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                isCurrent
                  ? "bg-blue-900 font-bold text-white shadow-xs"
                  : isCompleted
                  ? "text-slate-600 bg-white/70 border border-slate-200/60"
                  : "text-slate-400 opacity-70"
              }`}
            >
              {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
              {isCurrent && <Clock className="h-4 w-4 text-blue-200 animate-spin shrink-0" />}
              {isUpcoming && <Circle className="h-4 w-4 text-slate-300 shrink-0" />}

              <span className="truncate">
                {String(m.moduleNumber).padStart(2, "0")} — {m.title.replace(/^[0-9]+ — /, "")}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
