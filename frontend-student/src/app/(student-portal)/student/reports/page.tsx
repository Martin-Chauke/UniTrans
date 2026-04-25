"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { submitReport } from "@/api/modules/student/student.api";
import styles from "../subpage.module.css";

const REPORT_TYPES = [
  { value: "delay", label: "Report Delay", desc: "Bus is running late or delayed" },
  { value: "incident", label: "Report Incident", desc: "Safety issue or accident" },
  { value: "inquiry", label: "General Inquiry", desc: "Questions or general feedback" },
  { value: "other", label: "Contact Support", desc: "Other support requests" },
] as const;

type ReportType = "delay" | "incident" | "inquiry" | "other";

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const [type, setType] = useState<ReportType>("inquiry");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get("type") as ReportType;
    if (t && REPORT_TYPES.some(r => r.value === t)) setType(t);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Please provide a title."); return; }
    if (!description.trim()) { setError("Please describe the issue."); return; }
    setLoading(true);
    try {
      await submitReport({ title, report_type: type, description });
      setSuccess(true);
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: unknown } };
      const data = axiosError.response?.data;
      if (data && typeof data === "object") {
        const msgs = Object.values(data as Record<string, string[]>).flat();
        setError(msgs.join(" ") || "Submission failed. Please try again.");
      } else {
        setError("Submission failed. Please try again.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Report / Support</h1>
        <p className={styles.pageSub}>Submit a support ticket or report an issue</p>
      </div>

      <div className={styles.grid2}>
        {/* Type selection */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Report Type</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {REPORT_TYPES.map((r) => (
              <button
                key={r.value}
                onClick={() => setType(r.value)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 14px",
                  border: `1.5px solid ${type === r.value ? "var(--color-primary)" : "var(--color-border)"}`,
                  borderRadius: 10,
                  background: type === r.value ? "var(--color-sidebar-active)" : "var(--color-white)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.12s",
                }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", marginTop: 2, flexShrink: 0,
                  background: type === r.value ? "var(--color-primary)" : "var(--color-border)",
                  border: "2px solid",
                  borderColor: type === r.value ? "var(--color-primary)" : "var(--color-border)",
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Submit Report</div>
          {success && (
            <div className={styles.successBanner}>
              Your report has been submitted successfully. Our team will review it shortly.
            </div>
          )}
          {error && <div className={styles.errorBanner}>{error}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Report Type</label>
              <input className={styles.input} value={REPORT_TYPES.find(r => r.value === type)?.label ?? ""} readOnly />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                placeholder="Brief summary of the issue"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe the issue in detail…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Submitting…" : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
