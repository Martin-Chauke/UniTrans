import type { Incident } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import styles from "./PendingAlerts.module.css";

interface PendingAlertsProps {
  incidents: Incident[];
}

function incidentVariant(type: string) {
  if (type === "delay" || type === "breakdown" || type === "accident") return "incident";
  if (type === "capacity") return "warning";
  return "info";
}

export function PendingAlerts({ incidents }: PendingAlertsProps) {
  const open = incidents.filter((i) => !i.resolved);

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
        <span className={styles.count}>{open.length} active</span>
      </div>

      <div className={styles.list}>
        {open.length === 0 && (
          <p className={styles.empty}>No pending alerts</p>
        )}
        {open.map((incident) => (
          <div
            key={incident.incident_id}
            className={`${styles.item} ${styles[incidentVariant(incident.incident_type ?? "other")]}`}
          >
            <div className={styles.itemContent}>
              <span className={styles.itemTitle}>{incident.name}</span>
              <span className={styles.itemDesc}>{incident.description}</span>
              <span className={styles.itemDate}>
                {new Date(incident.reported_at).toLocaleString()}
              </span>
            </div>
            <Badge variant={incidentVariant(incident.incident_type ?? "other")}>
              {incident.incident_type ?? "other"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
