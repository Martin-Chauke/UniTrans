"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import {
  deleteDriverIncident,
  getDriverIncidents,
  getDriverLines,
  getDriverMe,
  postDriverIncident,
} from "@/api/modules/driver/driver.api";
import type { DriverMe } from "@/api/modules/driver/driver.api";
import type { DriverLine, Incident, IncidentType } from "@/api/types";
import { pickFirstApiError } from "@/lib/apiError";
import { Modal } from "@/components/ui/Modal";
import styles from "../subpage.module.css";

const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: "delay", label: "Delay" },
  { value: "breakdown", label: "Breakdown" },
  { value: "accident", label: "Accident" },
  { value: "capacity", label: "Capacity" },
  { value: "other", label: "Other" },
];

export default function DriverIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lines, setLines] = useState<DriverLine[]>([]);
  const [me, setMe] = useState<DriverMe | null>(null);
  const [linesLoadError, setLinesLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [form, setForm] = useState({
    line: 0,
    name: "",
    incident_type: "other" as IncidentType,
    description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLinesLoadError("");
    try {
      const i = await getDriverIncidents(1);
      setIncidents(i.data.results ?? []);
    } catch {
      setIncidents([]);
    }
    try {
      const profile = await getDriverMe();
      setMe(profile.data);
    } catch {
      setMe(null);
    }
    try {
      const linesRes = await getDriverLines();
      const lineResults = linesRes.data ?? [];
      setLines(lineResults);
      setForm((f) => {
        if (f.line && lineResults.some((l) => l.line_id === f.line)) return f;
        if (lineResults[0]) return { ...f, line: lineResults[0].line_id };
        return { ...f, line: 0 };
      });
    } catch {
      setLines([]);
      setLinesLoadError("Could not load lines for your bus. Ask your manager if routes should be assigned.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.line) {
      setError("Select a line.");
      return;
    }
    if (!form.name.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      await postDriverIncident({
        line: form.line,
        name: form.name.trim(),
        incident_type: form.incident_type,
        description: form.description.trim(),
      });
      setForm((f) => ({
        ...f,
        name: "",
        description: "",
      }));
      await load();
    } catch (err) {
      setError(
        pickFirstApiError(
          err,
          "Could not submit incident. The line must be one assigned to your bus."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmitLine = form.line > 0;
  const hasBus = me != null && me.assigned_bus != null;

  const incidentLocationLabel = (inc: Incident) => {
    if (inc.trip != null && inc.trip > 0) {
      return `TRP${String(inc.trip).padStart(3, "0")}`;
    }
    const n = inc.line_detail?.name?.trim() || inc.line_detail?.name;
    if (n) return n;
    if (inc.line != null && inc.line > 0) return `Line #${inc.line}`;
    return "—";
  };

  const closeDeleteModal = () => {
    if (!deletePending) {
      setDeleteTargetId(null);
      setDeleteError("");
    }
  };

  const confirmDeleteReport = async () => {
    if (deleteTargetId == null) return;
    setDeleteError("");
    setDeletePending(true);
    try {
      await deleteDriverIncident(deleteTargetId);
      setDeleteTargetId(null);
      await load();
    } catch (err) {
      setDeleteError(pickFirstApiError(err, "Could not delete this report."));
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Incidents</h1>
        <p className={styles.pageSub}>Report issues to your manager and read their responses</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Report an incident</div>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {me !== null && me.assigned_bus == null && (
          <div className={styles.errorBanner}>
            No bus is assigned to your profile yet. Ask your transport manager to assign a bus before you can report
            against a line.
          </div>
        )}
        {linesLoadError && <div className={styles.errorBanner}>{linesLoadError}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Line</label>
            {lines.length > 0 ? (
              <select
                className={styles.select}
                value={String(form.line)}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, line: Number(v) }));
                }}
              >
                {lines.map((ln) => (
                  <option key={ln.line_id} value={String(ln.line_id)}>
                    {ln.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className={styles.hintMuted}>
                {hasBus
                  ? "No lines are linked to your bus yet (routes or bus–line assignments). Your manager can add schedules or assignments."
                  : "Assign a bus to your account to load lines."}
              </p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Short title</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Late departure from campus"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <select
              className={styles.select}
              value={form.incident_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, incident_type: e.target.value as IncidentType }))
              }
            >
              {INCIDENT_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what happened…"
            />
          </div>
          <button type="submit" className={styles.btnPrimary} disabled={submitting || !canSubmitLine || !hasBus}>
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>My reports</div>
        {loading ? (
          <div className={styles.loading}><div className={styles.spinner} /></div>
        ) : incidents.length === 0 ? (
          <p className={styles.emptyState}>You have not submitted any incidents yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {incidents.map((inc) => (
              <div
                key={inc.incident_id}
                className={styles.notifItem}
                style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.notifMsg} style={{ fontWeight: 700 }}>{inc.name}</div>
                  <div className={styles.notifMeta}>
                    {inc.incident_type_display} · {incidentLocationLabel(inc)} ·{" "}
                    {new Date(inc.reported_at).toLocaleString()}
                    {inc.resolved ? " · Resolved" : ""}
                  </div>
                  <p className={styles.notifMsg} style={{ marginTop: 8 }}>{inc.description}</p>
                  {inc.manager_response ? (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 8,
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Manager reply</div>
                      <p className={styles.notifMsg}>{inc.manager_response}</p>
                      {inc.manager_responded_at && (
                        <span className={styles.notifMeta}>
                          {new Date(inc.manager_responded_at).toLocaleString()}
                          {inc.manager_response_by_name ? ` · ${inc.manager_response_by_name}` : ""}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className={styles.notifMeta} style={{ marginTop: 8 }}>Awaiting manager response</p>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.btnDanger}
                  onClick={() => {
                    setDeleteError("");
                    setDeleteTargetId(inc.incident_id);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={deleteTargetId !== null} onClose={closeDeleteModal} title="Delete this report?" size="sm">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          This removes the incident from your list and the manager portal. You cannot undo this.
        </p>
        {deleteError ? <div className={styles.errorBanner} style={{ marginTop: 12 }}>{deleteError}</div> : null}
        <div className={styles.modalActions}>
          <button type="button" className={styles.btnSecondary} onClick={closeDeleteModal} disabled={deletePending}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            style={{ background: "#dc2626" }}
            onClick={() => void confirmDeleteReport()}
            disabled={deletePending}
          >
            {deletePending ? "Deleting…" : "Delete report"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
