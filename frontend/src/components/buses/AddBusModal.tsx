"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateBus } from "@/hooks/useBuses";
import { useDrivers, usePatchDriver } from "@/hooks/useDrivers";
import type { BusStatus } from "@/api/types";
import styles from "./AddBusModal.module.css";

interface AddBusModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddBusModal({ open, onClose }: AddBusModalProps) {
  const { mutate: createBus, isPending } = useCreateBus();
  const { data: driversData } = useDrivers();
  const { mutate: patchDriver } = usePatchDriver();

  const drivers = (driversData?.results ?? []).filter((d) => d.is_active);

  const [form, setForm] = useState({
    registration_number: "",
    model: "",
    capacity: "",
    status: "available" as BusStatus,
    driver_id: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.registration_number.trim()) {
      setError("Registration number is required.");
      return;
    }
    if (!form.model.trim()) {
      setError("Model is required.");
      return;
    }
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1) {
      setError("A valid capacity is required.");
      return;
    }
    setError("");

    createBus(
      {
        registration_number: form.registration_number.trim(),
        model: form.model.trim(),
        capacity: Number(form.capacity),
        status: form.status,
      },
      {
        onSuccess: (res) => {
          const newBusId = res.data.bus_id;
          if (form.driver_id && newBusId) {
            patchDriver({ id: Number(form.driver_id), data: { assigned_bus: newBusId } });
          }
          handleClose();
        },
        onError: () => setError("Failed to add bus. Check for duplicate registration number."),
      }
    );
  };

  const handleClose = () => {
    setForm({ registration_number: "", model: "", capacity: "", status: "available", driver_id: "" });
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Bus">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>
            Registration Number <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={form.registration_number}
            onChange={(e) => setForm((f) => ({ ...f, registration_number: e.target.value }))}
            placeholder="e.g. BUS-2024-001"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>
              Model <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              placeholder="e.g. Mercedes-Benz Sprinter"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Capacity <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              className={styles.input}
              min={1}
              max={200}
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              placeholder="e.g. 50"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <select
            className={styles.select}
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BusStatus }))}
          >
            <option value="available">Available</option>
            <option value="in_service">In Service</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className={styles.divider} />
        <span className={styles.sectionLabel}>Driver Assignment (optional)</span>

        <div className={styles.field}>
          <label className={styles.label}>Assign Driver</label>
          <select
            className={styles.select}
            value={form.driver_id}
            onChange={(e) => setForm((f) => ({ ...f, driver_id: e.target.value }))}
          >
            <option value="">No driver assigned</option>
            {drivers.map((d) => (
              <option key={d.driver_id} value={d.driver_id}>
                {d.first_name} {d.last_name} — {d.license_number}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Adding..." : "Add Bus"}
          </button>
          <button className={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
