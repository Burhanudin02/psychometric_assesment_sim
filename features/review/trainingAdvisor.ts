import { CalculatedSessionResults } from "../scoring/calculator";
import { DOMAIN_LABELS } from "@/lib/curriculum";

export interface TrainingRecommendation {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  domain: string;
  actionableDrill: string;
  drillUrl: string;
  reasoning: string;
}

export function generateTrainingRecommendations(results: CalculatedSessionResults): TrainingRecommendation[] {
  const recommendations: TrainingRecommendation[] = [];

  // Sort domains by accuracy ascending to find weakest
  const sortedDomains = [...results.domainScores].sort((a, b) => a.accuracy - b.accuracy);

  // 1. Address lowest accuracy domain
  if (sortedDomains.length > 0 && sortedDomains[0].accuracy < 75) {
    const weakest = sortedDomains[0];
    const domainName = DOMAIN_LABELS[weakest.domain] || weakest.domain;
    recommendations.push({
      id: "REC_WEAK_DOMAIN",
      title: `Penguatan Konsep: ${domainName}`,
      priority: "HIGH",
      domain: weakest.domain,
      actionableDrill: `Lakukan 15 soal latihan terarah (drill) untuk domain ${domainName} dalam Mode Belajar tanpa batas waktu.`,
      drillUrl: `/practice?domain=${weakest.domain}&mode=LEARNING`,
      reasoning: `Akurasi Anda pada domain ${domainName} tercatat ${weakest.accuracy}%. Pahami langkah solusi dan strategi eliminasi sebelum menguji kecepatan.`,
    });
  }

  // 2. Address Slow + Accurate domains (Perfectionist pace risk)
  const slowAccurate = results.domainScores.find((d) => d.quadrant === "SLOW_ACCURATE");
  if (slowAccurate) {
    const domainName = DOMAIN_LABELS[slowAccurate.domain] || slowAccurate.domain;
    recommendations.push({
      id: "REC_PACING_DRILL",
      title: `Latihan Kecepatan (Speed Drill): ${domainName}`,
      priority: "HIGH",
      domain: slowAccurate.domain,
      actionableDrill: `Jalankan 10 soal ${domainName} dengan target waktu ketat (Speed Drill: 8 detik/soal).`,
      drillUrl: `/practice?domain=${slowAccurate.domain}&mode=SPEED_DRILL`,
      reasoning: `Akurasi Anda sangat baik (${slowAccurate.accuracy}%), namun waktu respons rata-rata (${(slowAccurate.medianResponseTimeMs / 1000).toFixed(1)}s) berisiko menyebabkan kehabisan waktu pada modul 60 detik.`,
    });
  }

  // 3. Address Fast + Inaccurate domains (Impulsive risk)
  const fastInaccurate = results.domainScores.find((d) => d.quadrant === "FAST_INACCURATE");
  if (fastInaccurate) {
    const domainName = DOMAIN_LABELS[fastInaccurate.domain] || fastInaccurate.domain;
    recommendations.push({
      id: "REC_ACCURACY_DRILL",
      title: `Latihan Ketelitian (Accuracy Drill): ${domainName}`,
      priority: "HIGH",
      domain: fastInaccurate.domain,
      actionableDrill: `Selesaikan 10 soal ${domainName} dengan mode Accuracy Drill: wajib luangkan minimal 4 detik untuk verifikasi sebelum submit.`,
      drillUrl: `/practice?domain=${fastInaccurate.domain}&mode=ACCURACY_DRILL`,
      reasoning: `Kecepatan Anda tinggi (${(fastInaccurate.medianResponseTimeMs / 1000).toFixed(1)}s), namun akurasi hanya ${fastInaccurate.accuracy}%. Terdeteksi kecenderungan menjawab terburu-buru.`,
    });
  }

  // 4. Address Fatigue Decay if detected
  if (results.fatigueIndex > 15) {
    recommendations.push({
      id: "REC_FATIGUE_MANAGEMENT",
      title: "Manajemen Daya Tahan Fokus (Cognitive Stamina)",
      priority: "MEDIUM",
      domain: "ALL",
      actionableDrill: "Lakukan simulasi berantai 5 modul berturut-turut untuk membiasakan fokus konsisten tanpa jeda.",
      drillUrl: "/simulation/prepare",
      reasoning: `Terdeteksi penurunan performa sebesar ${results.fatigueIndex}% pada sepertiga modul terakhir. Latih konsentrasi stabil dengan simulasi penuh.`,
    });
  }

  // Fallback if candidate did very well
  if (recommendations.length === 0) {
    recommendations.push({
      id: "REC_MAINTENANCE",
      title: "Pemeliharaan Ketajaman Kognitif",
      priority: "LOW",
      domain: "ALL",
      actionableDrill: "Jalankan 1 sesi simulasi 21 modul setiap 3-4 hari untuk mempertahankan refleks dan adaptasi tipe soal.",
      drillUrl: "/simulation/prepare",
      reasoning: "Performa keseluruhan Anda berada pada kategori optimal di seluruh domain kognitif.",
    });
  }

  return recommendations;
}
