"use client";

import { useState, useMemo } from "react";
import { useManagerSubscriptions } from "@/hooks/useSubscriptions";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import styles from "./subscription-history.module.css";

export default function SubscriptionHistoryPage() {
  const { data, isLoading } = useManagerSubscriptions();
  const subscriptions = data?.results ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch =
        s.student_name.toLowerCase().includes(search.toLowerCase()) ||
        `SUB${String(s.subscription_id).padStart(3, "0")}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.is_active) ||
        (statusFilter === "expired" && !s.is_active);
      return matchSearch && matchStatus;
    });
  }, [subscriptions, search, statusFilter]);

  const handleExport = () => {
    const header = ["ID", "Date", "Student", "Line", "Status"];
    const rows = filtered.map((s) => [
      `SUB${String(s.subscription_id).padStart(3, "0")}`,
      s.start_date,
      s.student_name,
      s.line_detail?.name ?? `Line ${s.line}`,
      s.is_active ? "active" : "expired",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscription-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Subscription History</h1>
          <p className={styles.subtitle}>Track student subscriptions and line changes</p>
        </div>
        <button className={styles.exportBtn} onClick={handleExport}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filters}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by subscription ID or student name..." />
          <select className={styles.select} value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading subscriptions...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>STUDENT</th>
                <th>LINE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const subId = `SUB${String(s.subscription_id).padStart(3, "0")}`;
                const lineName = s.line_detail?.name ?? `Line ${s.line}`;
                return (
                  <tr key={s.subscription_id}>
                    <td className={styles.subId}>{subId}</td>
                    <td>
                      <span className={styles.dateCell}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {new Date(s.start_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td>{s.student_name}</td>
                    <td>{lineName}</td>
                    <td>
                      <Badge variant={s.is_active ? "active" : "expired"}>
                        {s.is_active ? "active" : "expired"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.empty}>No subscriptions found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
