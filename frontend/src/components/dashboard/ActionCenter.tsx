"use client";

import styles from "./ActionCenter.module.css";

interface ActionCenterProps {
  onAddStudent: () => void;
  onAddDriver: () => void;
  onReportIncident: () => void;
  onQuickSchedule: () => void;
}

export function ActionCenter({ onAddStudent, onAddDriver, onReportIncident, onQuickSchedule }: ActionCenterProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        <span className={styles.titleIcon}>+</span> Action Center
      </h2>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.blue}`} onClick={onAddStudent}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Add Student
        </button>

        <button className={`${styles.btn} ${styles.green}`} onClick={onAddDriver}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Add Driver
        </button>

        <button className={`${styles.btn} ${styles.red}`} onClick={onReportIncident}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Report Incident
        </button>

        <button className={`${styles.btn} ${styles.purple}`} onClick={onQuickSchedule}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          Quick Schedule
        </button>
      </div>
    </div>
  );
}
