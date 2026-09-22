"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, History, TrendingUp, Award, AlertCircle, ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOMAIN_LABELS } from "@/lib/curriculum";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/assessment/history");
        const data = await res.json();
        if (data.success) {
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-600">Memuat riwayat simulasi...</span>
        </div>
      </div>
    );
  }

  const firstSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const latestSession = sessions.length > 0 ? sessions[0] : null;

  const firstAcc = firstSession?.result?.accuracy || 0;
  const latestAcc = latestSession?.result?.accuracy || 0;
  const improvement = Number((latestAcc - firstAcc).toFixed(1));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Beranda</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Dasbor Riwayat & Tren Performa
            </h1>
          </div>
          <Link href="/simulation/prepare">
            <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-xs font-semibold">
              Mulai Simulasi Baru
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
            <History className="h-12 w-12 text-slate-300 mx-auto" />
            <h2 className="text-base font-bold text-slate-800">Belum Ada Riwayat Simulasi</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Anda belum menyelesaikan simulasi 21 modul. Jalankan simulasi penuh untuk melihat tren perkembangan kecepatan dan akurasi Anda.
            </p>
            <Link href="/simulation/prepare">
              <Button className="bg-blue-900 hover:bg-blue-800 text-xs font-semibold px-6">
                Mulai Simulasi Pertama
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Comparison Highlights */}
            {sessions.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Percobaan Pertama
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-slate-900">{firstAcc}%</span>
                    <span className="text-xs text-slate-400">akurasi</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(firstSession.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Percobaan Terakhir
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-blue-950">{latestAcc}%</span>
                    <span className="text-xs text-slate-400">akurasi</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(latestSession.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Delta Perkembangan
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1">
                    <span
                      className={`text-2xl font-black ${
                        improvement >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {improvement >= 0 ? `+${improvement}%` : `${improvement}%`}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Akurasi vs percobaan pertama</span>
                </div>
              </div>
            )}

            {/* Session List Table */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Daftar Seluruh Simulasi 21 Modul ({sessions.length} Sesi)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-3 px-3">Sesi ID</th>
                      <th className="py-3 px-3">Tanggal</th>
                      <th className="py-3 px-3 text-center">Akurasi</th>
                      <th className="py-3 px-3 text-center">Median Waktu</th>
                      <th className="py-3 px-3 text-center">Timeout</th>
                      <th className="py-3 px-3 text-center">Kuadran</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.map((s, idx) => {
                      const res = s.result;
                      const num = sessions.length - idx;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-medium text-slate-900">
                            Simulasi #{num}
                            <span className="block text-[10px] font-mono text-slate-400">{s.id.substring(0, 8)}...</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {new Date(s.createdAt).toLocaleDateString()}{" "}
                            {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-slate-900">
                              {res ? `${res.accuracy}%` : "-"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-700">
                            {res ? `${(res.medianResponseTimeMs / 1000).toFixed(1)}s` : "-"}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600">
                            {res ? res.timeoutCount : "-"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-semibold text-slate-800 text-[11px]">
                              {res ? res.speedAccuracyCategory : "-"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link href={`/simulation/results/${s.id}`}>
                              <Button size="sm" variant="outline" className="text-xs h-8">
                                <BarChart3 className="h-3.5 w-3.5 mr-1 text-blue-900" />
                                <span>Hasil</span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
