"use client";

import React from "react";
import { DomainScoreSummary } from "@/features/scoring/calculator";
import { DOMAIN_LABELS } from "@/lib/curriculum";

interface DomainRadarChartProps {
  domainScores: DomainScoreSummary[];
}

export function DomainRadarChart({ domainScores }: DomainRadarChartProps) {
  const size = 320;
  const center = size / 2;
  const radius = center - 50;

  const validScores = domainScores.filter((d) => d.domain !== "MULTI_DOMAIN");
  const count = validScores.length || 8;
  const angleStep = (Math.PI * 2) / count;

  // Compute radar polygon points
  const points = validScores.map((ds, idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    const r = (ds.accuracy / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polygonPath = points.join(" ");

  // Background concentric grid rings (25%, 50%, 75%, 100%)
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center">
      <div className="w-full border-b border-slate-100 pb-3 mb-4 text-left">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Profil Kekuatan Domain Kognitif (Radar Chart)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Distribusi akurasi (%) pada masing-masing rumpun uji kognitif.
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Background grid concentric polygons */}
          {gridRings.map((fraction, i) => {
            const ringPoints = Array.from({ length: count }).map((_, idx) => {
              const angle = idx * angleStep - Math.PI / 2;
              const r = fraction * radius;
              return `${(center + r * Math.cos(angle)).toFixed(1)},${(center + r * Math.sin(angle)).toFixed(1)}`;
            }).join(" ");

            return (
              <polygon
                key={i}
                points={ringPoints}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray={i < 3 ? "3,3" : undefined}
              />
            );
          })}

          {/* Radial Axis Lines */}
          {Array.from({ length: count }).map((_, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Data Polygon */}
          {points.length > 0 && (
            <>
              <polygon
                points={polygonPath}
                fill="#2563EB"
                fillOpacity="0.25"
                stroke="#1D4ED8"
                strokeWidth="2.5"
              />
              {validScores.map((ds, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const r = (ds.accuracy / 100) * radius;
                const cx = center + r * Math.cos(angle);
                const cy = center + r * Math.sin(angle);
                return (
                  <circle
                    key={ds.domain}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#1E3A8A"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                );
              })}
            </>
          )}

          {/* Domain Labels */}
          {validScores.map((ds, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const labelRadius = radius + 22;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);
            const shortName = (DOMAIN_LABELS[ds.domain] || ds.domain)
              .replace(" Reasoning", "")
              .replace(" & Concentration", "")
              .replace(" + Accuracy", "");

            return (
              <text
                key={ds.domain}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-bold fill-slate-700 select-none"
              >
                {shortName} ({ds.accuracy}%)
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
