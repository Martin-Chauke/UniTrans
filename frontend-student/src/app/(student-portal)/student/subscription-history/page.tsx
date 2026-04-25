"use client";

import { useEffect, useState } from "react";
import { getSubscriptionHistory } from "@/api/modules/student/student.api";
import type { SubscriptionHistory } from "@/api/types";
import styles from "../subpage.module.css";

export default function SubscriptionHistoryPage() {
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
        <h1 className={styles.pageTitle}>Subscription History</h1>
        <p className={styles.pageSub}>All your past and current subscription records</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Subscription Records</div>
        {history.length === 0 ? (
          <div className={styles.emptyState}>No subscription history found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Previous Line</th>
                <th>New Line</th>
                <th>Change Date</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.subscription_history_id}>
                  <td>#{h.subscription_history_id}</td>
                  <td>{h.old_line_name || "—"}</td>
                  <td>{h.new_line_name || "—"}</td>
                  <td>{new Date(h.change_date).toLocaleDateString("en-GB")}</td>
                  <td>{h.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
