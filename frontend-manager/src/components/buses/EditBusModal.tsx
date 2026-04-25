"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { usePatchBus } from "@/hooks/useBuses";
import { useDrivers, usePatchDriver } from "@/hooks/useDrivers";
import type { Bus, BusStatus } from "@/api/types";
import styles from "./AddBusModal.module.css";

interface EditBusModalProps {
  open: boolean;
  onClose: () => void;
  bus: Bus | null;
  currentDriverId?: number | null;
}

export function EditBusModal({ open, onClose, bus, currentDriverId }: EditBusModalProps) {
  const { mutate: patchBus, isPending } = usePatchBus();
  const { data: driversData } = useDrivers();
  const { mutate: patchDriver } = usePatchDriver();

  const drivers = driversData?.results ?? [];

  const [form, setForm] = useState({
    registration_number: "",
    model: "",
    capacity: "",
    status: "available" as BusStatus,
    driver_id: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (bus && open) {
      const assignedDriver = drivers.find((d) => d.assigned_bus === bus.bus_id);
      setForm({
        registration_number: bus.registration_number,
        model: bus.model,
        capacity: String(bus.capacity),
        status: bus.status ?? "available",
        driver_id: assignedDriver ? String(assignedDriver.driver_id) : "",
      });
      setError("");
    }
  }, [bus, open, drivers]);

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
    if (!bus) return;
    setError("");

    patchBus(
      {
        id: bus.bus_id,
        data: {
          registration_number: form.registration_number.trim(),
          model: form.model.trim(),
          capacity: Number(form.capacity),
          status: form.status,
        },
      },
      {
        onSuccess: () => {
          const prevDriver = drivers.find((d) => d.assigned_bus === bus.bus_id);
          const newDriverId = form.driver_id ? Number(form.driver_id) : null;
          const prevDriverId = prevDriver?.driver_id ?? null;

          if (prevDriverId && prevDriverId !== newDriverId) {
            patchDriver({ id: prevDriverId, data: { assigned_bus: null } });
          }
          if (newDriverId && newDriverId !== prevDriverId) {
            patchDriver({ id: newDriverId, data: { assigned_bus: bus.bus_id } });
          }
          onClose();
        },
        onError: () => setError("Failed to update bus. Check for duplicate registration number."),
      }
    );
  };

  if (!bus) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Bus">
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
            {drivers
              .filter((d) => d.is_active || d.assigned_bus === bus.bus_id)
              .map((d) => (
                <option key={d.driver_id} value={d.driver_id}>
                  {d.first_name} {d.last_name} — {d.license_number}
                </option>
              ))}
          </select>
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
