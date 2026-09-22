"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export interface ReportItem {
  id: string;
  questionId: string;
  questionVersion: number;
  reason: string;
  comment: string | null;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED" | "DUPLICATE";
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  adminNote: string | null;
  question: {
    id: string;
    domain: string;
    subtopic: string;
    questionType: string;
    qualityStatus: "DRAFT" | "ACTIVE" | "REVIEW_REQUIRED" | "DEPRECATED";
    prompt: string;
    image?: string | null;
    imagePosition?: string;
    svgData?: string | null;
    options: any;
    correctAnswer: string;
    explanation: string;
    reportCount: number;
    version: number;
  };
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
  };
}

export function useQuestionReports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reports?status=${selectedStatus}&domain=${selectedDomain}`
      );
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedDomain]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const qPromptMatch = r.question?.prompt?.toLowerCase().includes(term);
      const qIdMatch = r.questionId?.toLowerCase().includes(term);
      const commentMatch = r.comment?.toLowerCase().includes(term);
      return qPromptMatch || qIdMatch || commentMatch;
    });
  }, [reports, searchTerm]);

  return {
    reports,
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
  };
}
