"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import {
  getDriverIncidents,
  getDriverTrips,
  postDriverIncident,
} from "@/api/modules/driver/driver.api";
import type { Incident, IncidentType, Trip } from "@/api/types";
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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    trip: 0,
    name: "",
    incident_type: "other" as IncidentType,
    description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [i, t] = await Promise.all([getDriverIncidents(1), getDriverTrips(1)]);
      setIncidents(i.data.results ?? []);
      const tripResults = t.data.results ?? [];
      setTrips(tripResults);
      setForm((f) => {
        if (f.trip) return f;
        if (tripResults[0]) return { ...f, trip: tripResults[0].trip_id };
        return f;
      });
    } catch {
      setIncidents([]);
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
    if (!form.trip) {
      setError("Select a trip.");
      return;
    }
    if (!form.name.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      await postDriverIncident({
        trip: form.trip,
        name: form.name.trim(),
        incident_type: form.incident_type,
        description: form.description.trim(),
      });
      setForm((f) => ({ ...f, name: "", description: "" }));
      await load();
    } catch {
      setError("Could not submit incident. Check the trip belongs to your bus.");
    } finally {
      setSubmitting(false);
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
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Trip</label>
            <select
              className={styles.select}
              value={form.trip || ""}
              onChange={(e) => setForm((f) => ({ ...f, trip: Number(e.target.value) }))}
              disabled={!trips.length}
            >
              {trips.map((t) => (
                <option key={t.trip_id} value={t.trip_id}>
                  TRP{String(t.trip_id).padStart(3, "0")} — {t.line_name ?? "Line"} ({t.status})
                </option>
              ))}
            </select>
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
          <button type="submit" className={styles.btnPrimary} disabled={submitting || !trips.length}>
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
              <div key={inc.incident_id} className={styles.notifItem}>
                <div>
                  <div className={styles.notifMsg} style={{ fontWeight: 700 }}>{inc.name}</div>
                  <div className={styles.notifMeta}>
                    {inc.incident_type_display} · TRP{String(inc.trip).padStart(3, "0")} ·{" "}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
