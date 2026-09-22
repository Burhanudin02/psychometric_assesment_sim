"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export interface UserItem {
  id: string;
  email: string | null;
  displayName: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  lastLoginAt: string | null;
  _count?: {
    sessions: number;
    reports: number;
  };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const emailMatch = u.email?.toLowerCase().includes(term);
      const nameMatch = u.displayName?.toLowerCase().includes(term);
      return emailMatch || nameMatch;
    });
  }, [users, searchTerm]);

  return {
    users,
    filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    statusMsg,
    setStatusMsg,
    errorMsg,
    setErrorMsg,
    loadUsers,
  };
}
