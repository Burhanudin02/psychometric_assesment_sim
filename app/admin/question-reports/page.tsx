"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flag, Check, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";
import { useQuestionReports, ReportItem } from "./components/useQuestionReports";
import { ReportSummaryCards } from "./components/ReportSummaryCards";
import { ReportFilterToolbar } from "./components/ReportFilterToolbar";
import { ReportTable } from "./components/ReportTable";
import { ReportActionDialog } from "./components/ReportActionDialog";

export default function AdminQuestionReportsPage() {
  const {
    filteredReports,
    summary,
    selectedStatus,
    setSelectedStatus,
    selectedDomain,
    setSelectedDomain,
    searchTerm,
    setSearchTerm,
    loading,
    statusMsg,
    setStatusMsg,
    loadReports,
  } = useQuestionReports();

  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="text-slate-500 hover:text-slate-800 transition-colors p-1 -ml-1 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <Flag className="h-4 w-4 text-amber-600" />
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Pusat Kendali & Resolusi Laporan Soal
              </h1>
            </div>
            <BetaBadge />
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/admin">
              <Button size="sm" variant="outline" className="text-xs h-8">
                <BookOpen className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                <span>Bank Soal</span>
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button size="sm" variant="outline" className="text-xs h-8">
                <Users className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                <span>Manajemen User</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-5">
        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{statusMsg}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="text-emerald-600 font-bold">×</button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <ReportSummaryCards summary={summary} />

        {/* Toolbar & Filters */}
        <ReportFilterToolbar
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Reports Data Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
            Memuat daftar laporan kendala soal...
          </div>
        ) : (
          <ReportTable
            reports={filteredReports}
            onOpenAction={setActiveReport}
          />
        )}
      </main>

      {/* 3. Action Dialog */}
      {activeReport && (
        <ReportActionDialog
          report={activeReport}
          onClose={() => setActiveReport(null)}
          onSuccess={(msg) => {
            setStatusMsg(msg);
            loadReports();
          }}
          onError={setStatusMsg}
        />
      )}
    </div>
  );
}
