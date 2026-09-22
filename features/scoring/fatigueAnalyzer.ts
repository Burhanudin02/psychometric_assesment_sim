export interface FatigueAnalysis {
  earlyAccuracy: number; // Modules 1-7 accuracy %
  middleAccuracy: number; // Modules 8-14 accuracy %
  lateAccuracy: number; // Modules 15-21 accuracy %
  fatigueIndex: number; // Early - Late accuracy drop
  hasFatigueDecay: boolean;
  observation: string;
}

export function analyzeFatigue(
  moduleAccuracies: { moduleNumber: number; accuracy: number }[]
): FatigueAnalysis {
  if (moduleAccuracies.length === 0) {
    return {
      earlyAccuracy: 0,
      middleAccuracy: 0,
      lateAccuracy: 0,
      fatigueIndex: 0,
      hasFatigueDecay: false,
      observation: "Data modul belum mencukupi untuk analisis ketahanan mental.",
    };
  }

  const early = moduleAccuracies.filter((m) => m.moduleNumber <= 7);
  const middle = moduleAccuracies.filter((m) => m.moduleNumber >= 8 && m.moduleNumber <= 14);
  const late = moduleAccuracies.filter((m) => m.moduleNumber >= 15);

  const avg = (arr: { accuracy: number }[]) =>
    arr.length ? arr.reduce((sum, item) => sum + item.accuracy, 0) / arr.length : 0;

  const earlyAcc = avg(early);
  const midAcc = avg(middle);
  const lateAcc = avg(late);

  const fatigueIndex = Number((earlyAcc - lateAcc).toFixed(1));
  const hasFatigueDecay = fatigueIndex > 15.0; // More than 15% drop

  let observation = "Stamina kognitif Anda relatif stabil dan konsisten dari awal hingga akhir 21 subtes.";
  if (hasFatigueDecay) {
    observation = `Terdeteksi penurunan performa (fatigue decay) sebesar ${fatigueIndex}% pada sepertiga modul akhir (Modul 15-21) dibanding modul awal. Disarankan melatih daya tahan fokus berkelanjutan.`;
  } else if (fatigueIndex < -10.0) {
    observation = "Akurasi Anda justru meningkat pada modul-modul akhir, menandakan kemampuan adaptasi pemanasan kognitif yang baik.";
  }

  return {
    earlyAccuracy: Number(earlyAcc.toFixed(1)),
    middleAccuracy: Number(midAcc.toFixed(1)),
    lateAccuracy: Number(lateAcc.toFixed(1)),
    fatigueIndex,
    hasFatigueDecay,
    observation,
  };
}
