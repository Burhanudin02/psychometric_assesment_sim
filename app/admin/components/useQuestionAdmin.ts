"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export function useQuestionAdmin() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedQuality, setSelectedQuality] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("" );
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/questions?domain=${selectedDomain}&qualityStatus=${selectedQuality}`
      );
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memuat daftar soal.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDomain, selectedQuality]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const promptMatch = q.prompt?.toLowerCase().includes(term);
      const idMatch = q.id?.toLowerCase().includes(term);
      const subtopicMatch = q.subtopic?.toLowerCase().includes(term);
      return promptMatch || idMatch || subtopicMatch;
    });
  }, [questions, searchTerm]);

  const handleExportJson = () => {
    window.open("/api/admin/export", "_blank");
  };

  return {
    questions,
    filteredQuestions,
    selectedDomain,
    setSelectedDomain,
    selectedQuality,
    setSelectedQuality,
    searchTerm,
    setSearchTerm,
    isLoading,
    statusMsg,
    setStatusMsg,
    errorMsg,
    setErrorMsg,
    loadQuestions,
    handleExportJson,
  };
}
