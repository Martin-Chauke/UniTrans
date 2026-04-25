"use client";

import { useEffect, useState } from "react";
import { getActiveSubscription, getLineTimetable } from "@/api/modules/student/student.api";
import type { Subscription, Timetable } from "@/api/types";
import styles from "../subpage.module.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulePage() {
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  useEffect(() => {
    (async () => {
      try {
        const subRes = await getActiveSubscription().catch(() => null);
        if (subRes?.data?.line) {
          setSubscription(subRes.data);
          const ttRes = await getLineTimetable(subRes.data.line).catch(() => null);
          if (ttRes) setTimetable(ttRes.data);
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const filteredSchedules = timetable?.schedules?.filter(s => s.day_of_week === selectedDay) ?? [];
  const lineName = subscription?.line_detail?.name ?? timetable?.line?.name ?? "—";

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>View Schedule</h1>
        <p className={styles.pageSub}>Full timetable for your assigned line: {lineName}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Select Day</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {DAYS.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              style={{
                padding: "6px 14px",
                border: "1.5px solid",
                borderColor: selectedDay === i ? "var(--color-primary)" : "var(--color-border)",
                borderRadius: "20px",
                background: selectedDay === i ? "var(--color-primary)" : "var(--color-white)",
                color: selectedDay === i ? "#fff" : "var(--color-text)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {DAYS[selectedDay]} Schedule — {lineName}
        </div>
        {filteredSchedules.length === 0 ? (
          <div className={styles.emptyState}>No trips scheduled for {DAYS[selectedDay]}.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Departure</th>
                <th>Arrival (Est.)</th>
                <th>Direction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((s, i) => (
                <tr key={s.schedule_id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 700 }}>{s.departure_time?.slice(0, 5)}</td>
                  <td>{s.arrival_time?.slice(0, 5)}</td>
                  <td>{s.direction ?? "—"}</td>
                  <td><span className={styles.badgeGreen}>Scheduled</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
