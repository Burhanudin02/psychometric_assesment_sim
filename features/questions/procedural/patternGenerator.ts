import { QuestionItem } from "../types";

export function generateProceduralPattern(): QuestionItem {
  const steps = [0, 90, 180];
  const nextAngle = 270;

  const svg = `<svg width="220" height="70" viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(30, 35)">
      <circle cx="0" cy="0" r="24" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
      <line x1="0" y1="0" x2="0" y2="-18" stroke="#2563EB" stroke-width="4"/>
    </g>
    <text x="68" y="42" font-family="sans-serif" font-size="20" fill="#64748B">→</text>
    <g transform="translate(110, 35)">
      <circle cx="0" cy="0" r="24" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
      <line x1="0" y1="0" x2="18" y2="0" stroke="#2563EB" stroke-width="4"/>
    </g>
    <text x="148" y="42" font-family="sans-serif" font-size="20" fill="#64748B">→</text>
    <g transform="translate(190, 35)">
      <circle cx="0" cy="0" r="24" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
      <line x1="0" y1="0" x2="0" y2="18" stroke="#2563EB" stroke-width="4"/>
    </g>
  </svg>`;

  return {
    id: `PROC_ABS_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    domain: "ABSTRACT_REASONING",
    subtopic: "rotation_pattern",
    questionType: "SVG_PATTERN",
    difficulty: "EASY",
    prompt: "Perhatikan perputaran jarum penunjuk biru pada diagram. Tentukan arah jarum penunjuk pada langkah ke-4:",
    svgData: svg,
    options: [
      {"id": "A", "text": "Menunjuk ke arah Barat (Kiri)"},
      {"id": "B", "text": "Menunjuk ke arah Utara (Atas)"},
      {"id": "C", "text": "Menunjuk ke arah Timur (Kanan)"},
      {"id": "D", "text": "Menunjuk ke arah Tenggara"}
    ],
    correctAnswer: "A",
    explanation: "Jarum penunjuk berputar konstan 90 derajat searah jarum jam (Utara -> Timur -> Selatan -> Barat).",
    solvingStrategy: "Identifikasi besar sudut rotasi (+90°) pada setiap transisi bingkai.",
    tags: ["procedural", "abstract", "rotation"],
    estimatedDifficulty: 1.8,
    isProcedural: true
  };
}
