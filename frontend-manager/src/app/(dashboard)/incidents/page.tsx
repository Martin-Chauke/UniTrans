"use client";

import { useState, useMemo } from "react";
import { useIncidents, useResolveIncident } from "@/hooks/useIncidents";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { ReportIncidentModal } from "@/components/incidents/ReportIncidentModal";
import styles from "./incidents.module.css";

const INCIDENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  delay: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#f59e0b" }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  breakdown: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#ef4444" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  capacity: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#f59e0b" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const getIcon = (type: string) =>
  INCIDENT_TYPE_ICONS[type] ?? INCIDENT_TYPE_ICONS.delay;

export default function IncidentsPage() {
  const { data, isLoading } = useIncidents();
  const { mutate: resolve } = useResolveIncident();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reportOpen, setReportOpen] = useState(false);

  const incidents = data?.results ?? [];

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        `TRP${String(inc.trip).padStart(3, "0")}`.toLowerCase().includes(search.toLowerCase()) ||
        inc.description.toLowerCase().includes(search.toLowerCase()) ||
        inc.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || inc.incident_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [incidents, search, typeFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Incidents</h1>
          <p className={styles.subtitle}>Track and manage system incidents</p>
        </div>
        <button className={styles.addBtn} onClick={() => setReportOpen(true)}>
          + Report Incident
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filters}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by trip ID or description..." />
          <select className={styles.select} value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="delay">Delay</option>
            <option value="breakdown">Breakdown</option>
            <option value="accident">Accident</option>
            <option value="capacity">Capacity</option>
            <option value="other">Other</option>
          </select>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading incidents...</div>
        ) : (
          <div className={styles.list}>
            {filtered.map((inc) => {
              const tripLabel = `Trp: TRP${String(inc.trip).padStart(3, "0")}`;
              return (
                <div key={inc.incident_id} className={styles.item}>
                  <div className={styles.iconCell}>
                    {getIcon(inc.incident_type ?? "other")}
                  </div>
                  <div className={styles.info}>
                    <div className={styles.topRow}>
                      <span className={styles.incidentName}>{inc.name}</span>
                      <Badge variant={inc.resolved ? "resolved" : "open"}>
                        {inc.resolved ? "resolved" : "open"}
                      </Badge>
                    </div>
                    <span className={styles.tripRef}>{tripLabel}</span>
                    <span className={styles.desc}>{inc.description}</span>
                    <span className={styles.date}>
                      Reported: {new Date(inc.reported_at).toLocaleString()}
                    </span>
                  </div>
                  {!inc.resolved && (
                    <button
                      className={styles.resolveBtn}
                      onClick={() => resolve(inc.incident_id)}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className={styles.empty}>No incidents found</div>
            )}
          </div>
        )}
      </div>

      <ReportIncidentModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
