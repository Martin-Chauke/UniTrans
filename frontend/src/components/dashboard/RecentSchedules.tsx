"use client";

import Link from "next/link";
import type { Schedule } from "@/api/types";
import { Badge, statusToBadge } from "@/components/ui/Badge";
import styles from "./RecentSchedules.module.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface RecentSchedulesProps {
  schedules: Schedule[];
  onQuickSchedule?: () => void;
}

export function RecentSchedules({ schedules, onQuickSchedule }: RecentSchedulesProps) {
  const recent = schedules.slice(0, 5);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          Recent Schedules
        </h2>
        <Link href="/schedule" className={styles.viewAll}>
          View all
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>LINE</th>
            <th>DAY</th>
            <th>DEPARTURE</th>
            <th>ARRIVAL</th>
            <th>STATIONS</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((s) => (
            <tr key={s.schedule_id}>
              <td className={styles.lineName}>{s.line_name}</td>
              <td>{DAYS[s.day_of_week] ?? s.day_of_week_display}</td>
              <td>{s.departure_time.slice(0, 5)}</td>
              <td>{s.arrival_time.slice(0, 5)}</td>
              <td>4 stops</td>
              <td><Badge variant="active">Active</Badge></td>
            </tr>
          ))}
          {recent.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.empty}>No schedules yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
