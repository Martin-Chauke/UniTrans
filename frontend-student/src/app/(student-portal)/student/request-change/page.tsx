"use client";

import { useEffect, useState, FormEvent } from "react";
import { getActiveSubscription, getLines, changeLine } from "@/api/modules/student/student.api";
import type { Subscription, Line } from "@/api/types";
import styles from "../subpage.module.css";

export default function RequestChangePage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLine, setSelectedLine] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [subRes, linesRes] = await Promise.allSettled([
          getActiveSubscription(),
          getLines(),
        ]);
        if (subRes.status === "fulfilled") setSubscription(subRes.value.data);
        if (linesRes.status === "fulfilled") setLines(linesRes.value.data.results ?? []);
      } finally { setLoading(false); }
    })();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLine) { setError("Please select a new line."); return; }
    setError("");
    setSubmitting(true);
    try {
      await changeLine({ new_line_id: parseInt(selectedLine), reason });
      setSuccess(true);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: unknown } };
      const data = axiosError.response?.data;
      if (data && typeof data === "object") {
        const msgs = Object.values(data as Record<string, string[]>).flat();
        setError(msgs.join(" ") || "Request failed. Please try again.");
      } else {
        setError("Request failed. Please try again.");
      }
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Request Line Change</h1>
        <p className={styles.pageSub}>Submit a request to change your assigned transport line</p>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Current Assignment</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Current Line</div>
              <div className={styles.detailValue}>{subscription?.line_detail?.name ?? "No active subscription"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Status</div>
              <div className={styles.detailValue}>
                <span className={subscription?.is_active ? styles.badgeGreen : styles.badgeRed}>
                  {subscription?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Request New Line</div>
          {success ? (
            <div className={styles.successBanner}>
              Your line change request has been submitted successfully! The transport manager will review it shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.errorBanner}>{error}</div>}
              <div className={styles.field}>
                <label className={styles.label}>Select New Line</label>
                <select
                  className={styles.select}
                  value={selectedLine}
                  onChange={e => setSelectedLine(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">— Select a line —</option>
                  {lines.filter(l => l.line_id !== subscription?.line).map(l => (
                    <option key={l.line_id} value={l.line_id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Reason (optional)</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Explain why you want to change your line…"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
