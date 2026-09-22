import React from "react";
import Link from "next/link";
import { Search, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOMAIN_LABELS } from "@/lib/curriculum";

interface ReportFilterToolbarProps {
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function ReportFilterToolbar({
  selectedStatus,
  onSelectStatus,
  selectedDomain,
  onSelectDomain,
  searchTerm,
  onSearchChange,
}: ReportFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari teks soal, ID, atau komentar pelapor..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="flex items-center space-x-2 text-xs">
        <select
          value={selectedStatus}
          onChange={(e) => onSelectStatus(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
        >
          <option value="ALL">Semua Status</option>
          <option value="OPEN">OPEN (Perlu Tindakan)</option>
          <option value="IN_REVIEW">IN_REVIEW (Sedang Ditinjau)</option>
          <option value="RESOLVED">RESOLVED (Selesai)</option>
          <option value="DISMISSED">DISMISSED (Ditolak)</option>
        </select>

        <select
          value={selectedDomain}
          onChange={(e) => onSelectDomain(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
        >
          <option value="ALL">Semua Domain</option>
          {Object.entries(DOMAIN_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>

        <Link href="/admin">
          <Button size="sm" variant="outline" className="text-xs h-9">
            <BookOpen className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            <span>Bank Soal</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
