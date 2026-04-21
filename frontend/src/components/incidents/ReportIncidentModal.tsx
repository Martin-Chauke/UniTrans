"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateIncident } from "@/hooks/useIncidents";
import { useTrips } from "@/hooks/useTrips";
import type { IncidentType } from "@/api/types";
import styles from "./ReportIncidentModal.module.css";

const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: "delay", label: "Delay" },
  { value: "breakdown", label: "Breakdown" },
  { value: "accident", label: "Accident" },
  { value: "capacity", label: "Capacity Exceeded" },
  { value: "other", label: "Other" },
];

interface ReportIncidentModalProps {
  open: boolean;
  onClose: () => void;
  defaultTripId?: number;
}

export function ReportIncidentModal({ open, onClose, defaultTripId }: ReportIncidentModalProps) {
  const { data: tripsData } = useTrips();
  const { mutate: createIncident, isPending } = useCreateIncident();

  const [form, setForm] = useState({
    name: "",
    incident_type: "delay" as IncidentType,
    description: "",
    trip: defaultTripId ?? 0,
  });
  const [error, setError] = useState("");

  const trips = tripsData?.results ?? [];

  const handleSubmit = () => {
    if (!form.name.trim()) { setError("Incident name is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.trip) { setError("Please select a trip."); return; }
    setError("");

    createIncident(
      { name: form.name, incident_type: form.incident_type, description: form.description, trip: form.trip },
      {
        onSuccess: () => {
          setForm({ name: "", incident_type: "delay", description: "", trip: defaultTripId ?? 0 });
          onClose();
        },
        onError: () => setError("Failed to submit incident. Please try again."),
      }
    );
  };

  const handleClose = () => {
    setForm({ name: "", incident_type: "delay", description: "", trip: defaultTripId ?? 0 });
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Report Incident" size="sm">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Incident Name</label>
          <input
            type="text"
            className={styles.input}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Brief title..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Incident Type</label>
          <select
            className={styles.select}
            value={form.incident_type}
            onChange={(e) => setForm((f) => ({ ...f, incident_type: e.target.value as IncidentType }))}
          >
            {INCIDENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {!defaultTripId && (
          <div className={styles.field}>
            <label className={styles.label}>Trip</label>
            <select
              className={styles.select}
              value={form.trip || ""}
              onChange={(e) => setForm((f) => ({ ...f, trip: Number(e.target.value) }))}
            >
              <option value="">Select a trip</option>
              {trips.map((t) => (
                <option key={t.trip_id} value={t.trip_id}>
                  TRP{String(t.trip_id).padStart(3, "0")} — {t.line_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe the incident..."
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Report"}
          </button>
          <button className={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
