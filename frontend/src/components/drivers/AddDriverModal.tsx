"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useBuses } from "@/hooks/useBuses";
import { useCreateDriver } from "@/hooks/useDrivers";
import styles from "./AddDriverModal.module.css";

interface AddDriverModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddDriverModal({ open, onClose }: AddDriverModalProps) {
  const { data: busesData } = useBuses();
  const buses = busesData?.results ?? [];
  const { mutate: createDriver, isPending } = useCreateDriver();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    assigned_bus: "",
  });
  const [error, setError] = useState("");

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
    setError("");

    createDriver(
      {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        license_number: form.license_number,
        assigned_bus: form.assigned_bus ? Number(form.assigned_bus) : null,
      },
      {
        onSuccess: () => {
          handleClose();
        },
        onError: () => {
          setError("Failed to add driver. Check for duplicate email or license number.");
        },
      }
    );
  };

  const handleClose = () => {
    setForm({ first_name: "", last_name: "", email: "", phone: "", license_number: "", assigned_bus: "" });
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Driver">
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
          <label className={styles.label}>Assign Bus</label>
          <select
            className={styles.select}
            value={form.assigned_bus}
            onChange={(e) => setForm((f) => ({ ...f, assigned_bus: e.target.value }))}
          >
            <option value="">Select a bus (optional)</option>
            {buses.map((b) => (
              <option key={b.bus_id} value={b.bus_id}>
                {b.registration_number} — {b.model} (cap. {b.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Adding..." : "Add Driver"}
          </button>
          <button className={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
