"use client";

import { useEffect, useState } from "react";
import { getSubscriptionHistory } from "@/api/modules/student/student.api";
import type { SubscriptionHistory } from "@/api/types";
import styles from "../subpage.module.css";

export default function RequestsPage() {
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
        <h1 className={styles.pageTitle}>My Requests</h1>
        <p className={styles.pageSub}>Track the status of your line change requests</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Request History</div>
        {history.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No requests found.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Submit a line change request to see it here.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Requested Line</th>
                <th>From Line</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.subscription_history_id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{h.new_line_name || "—"}</td>
                  <td>{h.old_line_name || "—"}</td>
                  <td>{new Date(h.change_date).toLocaleDateString("en-GB")}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.reason || "—"}
                  </td>
                  <td><span className={styles.badgeBlue}>Processed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
