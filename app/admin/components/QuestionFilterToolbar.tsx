import React from "react";
import Link from "next/link";
import { Search, Plus, Download, Users, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOMAIN_LABELS } from "@/lib/curriculum";

interface QuestionFilterToolbarProps {
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  selectedQuality: string;
  onSelectQuality: (quality: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenCreateModal: () => void;
  onExportJson: () => void;
}

export function QuestionFilterToolbar({
  selectedDomain,
  onSelectDomain,
  selectedQuality,
  onSelectQuality,
  searchTerm,
  onSearchChange,
  onOpenCreateModal,
  onExportJson,
}: QuestionFilterToolbarProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan ID, teks pertanyaan, subtopik..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/users">
            <Button size="sm" variant="outline" className="text-xs h-9">
              <Users className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              <span>Manajemen Akun</span>
            </Button>
          </Link>

          <Link href="/admin/question-reports">
            <Button size="sm" variant="outline" className="text-xs h-9">
              <Flag className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              <span>Laporan Soal</span>
            </Button>
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={onExportJson}
            className="text-xs h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            <span>Ekspor JSON</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenCreateModal}
            className="bg-blue-900 hover:bg-blue-800 text-white text-xs h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Tambah Soal</span>
          </Button>
        </div>
      </div>

      {/* Filter Selectors Row */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Domain:</span>
          <select
            value={selectedDomain}
            onChange={(e) => onSelectDomain(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Semua Domain</option>
            {Object.entries(DOMAIN_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Status Mutu:</span>
          <select
            value={selectedQuality}
            onChange={(e) => onSelectQuality(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">ACTIVE (Aktif Terverifikasi)</option>
            <option value="REVIEW_REQUIRED">REVIEW_REQUIRED (Perlu Ditinjau)</option>
            <option value="DRAFT">DRAFT (Konsep)</option>
            <option value="DEPRECATED">DEPRECATED (Usang)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
