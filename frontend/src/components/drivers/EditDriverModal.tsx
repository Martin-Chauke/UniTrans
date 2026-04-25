"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { usePatchDriver } from "@/hooks/useDrivers";
import { useBuses } from "@/hooks/useBuses";
import type { Driver } from "@/api/types";
import styles from "./AddDriverModal.module.css";

interface EditDriverModalProps {
  open: boolean;
  onClose: () => void;
  driver: Driver | null;
}

export function EditDriverModal({ open, onClose, driver }: EditDriverModalProps) {
  const { data: busesData } = useBuses();
  const buses = busesData?.results ?? [];
  const { mutate: patchDriver, isPending } = usePatchDriver();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    assigned_bus: "",
    is_active: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (driver && open) {
      setForm({
        first_name: driver.first_name,
        last_name: driver.last_name,
        email: driver.email,
        phone: driver.phone ?? "",
        license_number: driver.license_number,
        assigned_bus: driver.assigned_bus ? String(driver.assigned_bus) : "",
        is_active: driver.is_active ?? true,
      });
      setError("");
    }
  }, [driver, open]);

  const handleSubmit = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!form.license_number.trim()) {
      setError("License number is required.");
      return;
    }
    if (!driver) return;
    setError("");

    patchDriver(
      {
        id: driver.driver_id,
        data: {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          license_number: form.license_number,
          assigned_bus: form.assigned_bus ? Number(form.assigned_bus) : null,
          is_active: form.is_active,
        },
      },
      {
        onSuccess: () => onClose(),
        onError: () => setError("Failed to update driver. Check for duplicate email or license number."),
      }
    );
  };

  if (!driver) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Driver">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>
              First Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              placeholder="First name"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Last Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Email <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            className={styles.input}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="driver@example.com"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Phone</label>
          <input
            type="tel"
            className={styles.input}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1234567890"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            License Number <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={form.license_number}
            onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))}
            placeholder="e.g. DL-2024-001"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Assigned Bus</label>
          <select
            className={styles.select}
            value={form.assigned_bus}
            onChange={(e) => setForm((f) => ({ ...f, assigned_bus: e.target.value }))}
          >
            <option value="">No bus assigned</option>
            {buses.map((b) => (
              <option key={b.bus_id} value={b.bus_id}>
                {b.registration_number} — {b.model} (cap. {b.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <select
            className={styles.select}
            value={form.is_active ? "active" : "inactive"}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "active" }))}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
