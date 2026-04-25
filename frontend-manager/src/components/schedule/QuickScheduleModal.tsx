"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateSchedule } from "@/hooks/useSchedules";
import { useLines } from "@/hooks/useLines";
import type { DayOfWeek } from "@/api/types";
import styles from "./QuickScheduleModal.module.css";

const DAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

interface QuickScheduleModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickScheduleModal({ open, onClose }: QuickScheduleModalProps) {
  const { data: linesData } = useLines();
  const { mutate: createSchedule, isPending } = useCreateSchedule();

  const [form, setForm] = useState({
    line: "",
    day_of_week: "" as "" | DayOfWeek,
    departure_time: "",
    arrival_time: "",
    direction: "",
  });
  const [error, setError] = useState("");

  const lines = linesData?.results ?? [];

  const handleSubmit = () => {
    if (!form.line) { setError("Please select a line."); return; }
    if (form.day_of_week === "") { setError("Please select a day."); return; }
    if (!form.departure_time) { setError("Departure time is required."); return; }
    if (!form.arrival_time) { setError("Arrival time is required."); return; }
    setError("");

    createSchedule(
      {
        line: Number(form.line),
        day_of_week: form.day_of_week as DayOfWeek,
        departure_time: form.departure_time,
        arrival_time: form.arrival_time,
        direction: form.direction || undefined,
      },
      {
        onSuccess: () => {
          setForm({ line: "", day_of_week: "", departure_time: "", arrival_time: "", direction: "" });
          onClose();
        },
        onError: () => setError("Failed to create schedule."),
      }
    );
  };

  const handleClose = () => {
    setForm({ line: "", day_of_week: "", departure_time: "", arrival_time: "", direction: "" });
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Quick Schedule" size="md">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

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
          <label className={styles.label}>Day <span className={styles.required}>*</span></label>
          <select
            className={styles.select}
            value={String(form.day_of_week)}
            onChange={(e) => setForm((f) => ({ ...f, day_of_week: e.target.value === "" ? "" : Number(e.target.value) as DayOfWeek }))}
          >
            <option value="">Select a day</option>
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Departure <span className={styles.required}>*</span></label>
            <input
              type="time"
              className={styles.input}
              value={form.departure_time}
              onChange={(e) => setForm((f) => ({ ...f, departure_time: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Arrival <span className={styles.required}>*</span></label>
            <input
              type="time"
              className={styles.input}
              value={form.arrival_time}
              onChange={(e) => setForm((f) => ({ ...f, arrival_time: e.target.value }))}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Direction (optional)</label>
          <input
            type="text"
            className={styles.input}
            value={form.direction}
            onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}
            placeholder="e.g. Inbound, Outbound"
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Creating..." : "Create Schedule"}
          </button>
          <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}
