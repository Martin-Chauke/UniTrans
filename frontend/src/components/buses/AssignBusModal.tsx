"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateBusAssignment } from "@/hooks/useBuses";
import { useLines } from "@/hooks/useLines";
import { useBuses } from "@/hooks/useBuses";
import styles from "./AssignBusModal.module.css";

interface AssignBusModalProps {
  open: boolean;
  onClose: () => void;
  busId?: number;
}

export function AssignBusModal({ open, onClose, busId }: AssignBusModalProps) {
  const { data: linesData } = useLines();
  const { data: busesData } = useBuses();
  const { mutate: assign, isPending } = useCreateBusAssignment();

  const lines = linesData?.results ?? [];
  const buses = busesData?.results ?? [];

  const [form, setForm] = useState({
    bus: busId ? String(busId) : "",
    line: "",
    start_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        bus: busId ? String(busId) : "",
        line: "",
        start_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setError("");
    }
  }, [open, busId]);

  const handleSubmit = () => {
    if (!form.bus) { setError("Please select a bus."); return; }
    if (!form.line) { setError("Please select a line."); return; }
    if (!form.start_date) { setError("Start date is required."); return; }
    setError("");

    assign(
      {
        bus: Number(form.bus),
        line: Number(form.line),
        start_date: form.start_date,
        notes: form.notes,
      },
      {
        onSuccess: () => onClose(),
        onError: () => setError("Failed to assign bus. It may already be assigned."),
      }
    );
  };

  const selectedBusLabel = busId
    ? buses.find((b) => b.bus_id === busId)?.registration_number
    : null;

  return (
    <Modal open={open} onClose={onClose} title="Assign Bus to Line" size="sm">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        {selectedBusLabel ? (
          <div className={styles.field}>
            <label className={styles.label}>Bus</label>
            <div className={styles.readonlyValue}>{selectedBusLabel}</div>
          </div>
        ) : (
          <div className={styles.field}>
            <label className={styles.label}>Bus <span className={styles.required}>*</span></label>
            <select
              className={styles.select}
              value={form.bus}
              onChange={(e) => setForm((f) => ({ ...f, bus: e.target.value }))}
            >
              <option value="">Select a bus</option>
              {buses.map((b) => (
                <option key={b.bus_id} value={b.bus_id}>
                  {b.registration_number} — {b.model}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Line <span className={styles.required}>*</span></label>
          <select
            className={styles.select}
            value={form.line}
            onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))}
          >
            <option value="">Select a line</option>
            {lines.map((l) => (
              <option key={l.line_id} value={l.line_id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Start Date <span className={styles.required}>*</span></label>
          <input
            type="date"
            className={styles.input}
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Notes</label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes..."
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Assigning..." : "Assign Bus"}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}
