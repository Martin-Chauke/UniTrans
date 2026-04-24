"use client";

import { useEffect, useState } from "react";
import { getSubscriptionHistory } from "@/api/modules/student/student.api";
import type { SubscriptionHistory } from "@/api/types";
import styles from "../subpage.module.css";

export default function AssignmentHistoryPage() {
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionHistory()
      .then(r => setHistory(r.data.results ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Assignment History</h1>
        <p className={styles.pageSub}>Timeline of all your line assignments across semesters</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Assignment Timeline</div>
        {history.length === 0 ? (
          <div className={styles.emptyState}>No assignment history available.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, padding: "8px 0" }}>
            {history.map((h, i) => (
              <div key={h.subscription_history_id} style={{ display: "flex", gap: 16, position: "relative" }}>
                {i < history.length - 1 && (
                  <div style={{ position: "absolute", left: 6, top: 18, width: 2, height: "calc(100% - 4px)", background: "var(--color-border)" }} />
                )}
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: i === 0 ? "var(--color-primary)" : "var(--color-white)",
                  border: `2.5px solid ${i === 0 ? "var(--color-primary)" : "var(--color-border)"}`,
                  flexShrink: 0, marginTop: 4, zIndex: 1,
                }} />
                <div style={{ flex: 1, paddingBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>
                      {h.new_line_name || h.old_line_name}
                    </span>
                    {i === 0 && (
                      <span className={styles.badgeGreen} style={{ fontSize: 10 }}>Current</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 3 }}>
                    Changed on {new Date(h.change_date).toLocaleDateString("en-GB")}
                    {h.old_line_name && ` — from ${h.old_line_name}`}
                  </div>
                  {h.reason && (
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4, fontStyle: "italic" }}>
                      Reason: {h.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
