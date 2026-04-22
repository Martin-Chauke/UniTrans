"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateTrip } from "@/hooks/useTrips";
import { useSchedules } from "@/hooks/useSchedules";
import { useBuses } from "@/hooks/useBuses";
import type { TripStatus } from "@/api/types";
import styles from "./CreateTripModal.module.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const STATUS_OPTIONS: { value: TripStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface CreateTripModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTripModal({ open, onClose }: CreateTripModalProps) {
  const { data: schedulesData, isLoading: schedulesLoading } = useSchedules();
  const { data: busesData, isLoading: busesLoading } = useBuses();
  const { mutate: createTrip, isPending } = useCreateTrip();

  const [form, setForm] = useState({
    schedule: 0,
    bus: 0,
    status: "scheduled" as TripStatus,
  });
  const [error, setError] = useState("");

  const schedules = schedulesData?.results ?? [];
  const buses = busesData?.results ?? [];

  const handleSubmit = () => {
    if (!form.schedule) { setError("Please select a schedule."); return; }
    if (!form.bus) { setError("Please select a bus."); return; }
    setError("");

    createTrip(
      { schedule: form.schedule, bus: form.bus, status: form.status },
      {
        onSuccess: () => {
          setForm({ schedule: 0, bus: 0, status: "scheduled" });
          onClose();
        },
        onError: () => setError("Failed to create trip. Please try again."),
      }
    );
  };

  const handleClose = () => {
    setForm({ schedule: 0, bus: 0, status: "scheduled" });
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Trip" size="sm">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Schedule</label>
          <select
            className={styles.select}
            value={form.schedule || ""}
            onChange={(e) => setForm((f) => ({ ...f, schedule: Number(e.target.value) }))}
            disabled={schedulesLoading}
          >
            <option value="">
              {schedulesLoading ? "Loading schedules..." : schedules.length === 0 ? "No schedules available" : "Select a schedule"}
            </option>
            {schedules.map((s) => (
              <option key={s.schedule_id} value={s.schedule_id}>
                SCH{String(s.schedule_id).padStart(3, "0")} — {s.line_name} · {DAYS[s.day_of_week] ?? s.day_of_week_display} {s.departure_time.slice(0, 5)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Bus</label>
          <select
            className={styles.select}
            value={form.bus || ""}
            onChange={(e) => setForm((f) => ({ ...f, bus: Number(e.target.value) }))}
            disabled={busesLoading}
          >
            <option value="">
              {busesLoading ? "Loading buses..." : buses.length === 0 ? "No buses available" : "Select a bus"}
            </option>
            {buses.map((b) => (
              <option key={b.bus_id} value={b.bus_id}>
                {b.registration_number} — {b.capacity} seats
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Initial Status</label>
          <select
            className={styles.select}
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TripStatus }))}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Creating..." : "Create Trip"}
          </button>
          <button className={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
