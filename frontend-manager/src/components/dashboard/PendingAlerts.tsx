"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Incident } from "@/api/types";
import type { StudentReportItem } from "@/api/modules/reports/reports.api";
import { resolveStudentReport } from "@/api/modules/reports/reports.api";
import { Badge } from "@/components/ui/Badge";
import styles from "./PendingAlerts.module.css";

interface PendingAlertsProps {
  incidents: Incident[];
  openReports: StudentReportItem[];
  reportsLoading?: boolean;
}

type ReportTypeBadge = "warning" | "incident" | "info";

const REPORT_TYPE_COLORS: Record<string, ReportTypeBadge> = {
  delay: "warning",
  incident: "incident",
  inquiry: "info",
  other: "info",
};

function incidentVariant(type: string) {
  if (type === "delay" || type === "breakdown" || type === "accident") return "incident";
  if (type === "capacity") return "warning";
  return "info";
}

function incidentTripLineLabel(inc: Incident) {
  const lineName = inc.trip_detail?.line_name?.trim() ?? "";
  const tripId = `TRP${String(inc.trip).padStart(3, "0")}`;
  return lineName ? `Trip: ${tripId} — ${lineName}` : `Trip: ${tripId}`;
}

type CombinedItem =
  | { kind: "incident"; id: number; at: string; incident: Incident }
  | { kind: "report"; id: number; at: string; report: StudentReportItem };

export function PendingAlerts({ incidents, openReports, reportsLoading }: PendingAlertsProps) {
  const qc = useQueryClient();
  const openIncidents = useMemo(() => incidents.filter((i) => !i.resolved), [incidents]);

  const { mutate: resolve } = useMutation({
    mutationFn: resolveStudentReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager-student-reports"] });
      qc.invalidateQueries({ queryKey: ["manager-notifications"] });
    },
  });

  const combined = useMemo(() => {
    const rows: CombinedItem[] = [
      ...openIncidents.map((incident) => ({
        kind: "incident" as const,
        id: incident.incident_id,
        at: incident.reported_at,
        incident,
      })),
      ...openReports.map((report) => ({
        kind: "report" as const,
        id: report.report_id,
        at: report.submitted_at,
        report,
      })),
    ];
    rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return rows;
  }, [openIncidents, openReports]);

  const totalPending = openIncidents.length + openReports.length;
  const empty = combined.length === 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={styles.alertIcon}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Pending Alerts
        </h2>
        <span className={styles.count}>{totalPending} active</span>
      </div>

      <div className={styles.list}>
        {reportsLoading && empty && <p className={styles.empty}>Loading…</p>}
        {!reportsLoading && empty && <p className={styles.empty}>No pending alerts</p>}
        {combined.map((row) =>
          row.kind === "incident" ? (
            <div
              key={`i-${row.incident.incident_id}`}
              className={`${styles.item} ${styles[incidentVariant(row.incident.incident_type ?? "other")]}`}
            >
              <div className={styles.itemContent}>
                <span className={styles.itemTitle}>{row.incident.name}</span>
                <span className={styles.incidentTripRef}>{incidentTripLineLabel(row.incident)}</span>
                <span className={styles.itemDesc}>{row.incident.description}</span>
                <span className={styles.itemDate}>{new Date(row.incident.reported_at).toLocaleString()}</span>
              </div>
              <Badge variant={incidentVariant(row.incident.incident_type ?? "other")}>
                {row.incident.incident_type ?? "other"}
              </Badge>
            </div>
          ) : (
            <div key={`r-${row.report.report_id}`} className={`${styles.item} ${styles.reportItem}`}>
              <div className={styles.itemContent}>
                <div className={styles.reportTop}>
                  <Badge variant={REPORT_TYPE_COLORS[row.report.report_type] ?? "info"}>
                    {row.report.report_type_display}
                  </Badge>
                  <span className={styles.reportStudent}>{row.report.student_name}</span>
                  <span className={styles.itemDate}>
                    {new Date(row.report.submitted_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span className={styles.itemTitle}>{row.report.title}</span>
                <span className={styles.itemDesc}>{row.report.description}</span>
              </div>
              <div className={styles.reportActions}>
                <Badge variant="warning">{row.report.status_display}</Badge>
                <button type="button" className={styles.resolveBtn} onClick={() => resolve(row.report.report_id)}>
                  Resolve
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
