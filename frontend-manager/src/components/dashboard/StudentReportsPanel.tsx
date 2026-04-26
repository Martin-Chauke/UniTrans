"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentReports, resolveStudentReport, type StudentReportItem } from "@/api/modules/reports/reports.api";
import { Badge } from "@/components/ui/Badge";
import styles from "./StudentReportsPanel.module.css";

type ReportTypeBadge = "warning" | "incident" | "info";

const TYPE_COLORS: Record<string, ReportTypeBadge> = {
  delay: "warning",
  incident: "incident",
  inquiry: "info",
  other: "info",
};

export function StudentReportsPanel() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"" | "open" | "resolved">("");

  const { data: reports = [], isLoading } = useQuery<StudentReportItem[]>({
    queryKey: ["manager-student-reports", filter],
    queryFn: async () => {
      const res = await getStudentReports(filter || undefined);
      // Handle both array and paginated { results: [] } responses
      const d = res.data as unknown;
      if (Array.isArray(d)) return d;
      if (d && typeof d === "object" && "results" in (d as object)) {
        return (d as { results: StudentReportItem[] }).results;
      }
      return [];
    },
  });

  const { mutate: resolve } = useMutation({
    mutationFn: resolveStudentReport,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manager-student-reports"] }),
  });

  const open = reports.filter((r) => r.status === "open");
  const shown = reports.slice(0, 8);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={styles.icon}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h2 className={styles.title}>Student Reports</h2>
        </div>
        <div className={styles.controls}>
          <span className={styles.count}>{open.length} open</span>
          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className={styles.list}>
        {isLoading && <p className={styles.empty}>Loading…</p>}
        {!isLoading && shown.length === 0 && (
          <p className={styles.empty}>No student reports {filter ? `with status "${filter}"` : "yet"}</p>
        )}
        {shown.map((r) => (
          <div key={r.report_id} className={`${styles.item} ${r.status === "resolved" ? styles.resolved : ""}`}>
            <div className={styles.itemLeft}>
              <div className={styles.itemTop}>
                <Badge variant={TYPE_COLORS[r.report_type] ?? "info"}>
                  {r.report_type_display}
                </Badge>
                <span className={styles.studentName}>{r.student_name}</span>
                <span className={styles.itemDate}>
                  {new Date(r.submitted_at).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              <div className={styles.itemTitle}>{r.title}</div>
              <div className={styles.itemDesc}>{r.description}</div>
            </div>
            <div className={styles.itemRight}>
              <Badge variant={r.status === "resolved" ? "active" : "warning"}>
                {r.status_display}
              </Badge>
              {r.status === "open" && (
                <button
                  className={styles.resolveBtn}
                  onClick={() => resolve(r.report_id)}
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
