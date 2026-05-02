"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { usePatchDriver } from "@/hooks/useDrivers";
import { useBuses } from "@/hooks/useBuses";
import type { Driver } from "@/api/types";
import { normalizePhoneFlexible } from "@/lib/phone";
import { pickFirstApiError } from "@/lib/apiError";
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
    portal_password: "",
  });
  const [error, setError] = useState("");
  const [showStoredPassword, setShowStoredPassword] = useState(false);
  const [showNewPortalPassword, setShowNewPortalPassword] = useState(false);

  const selectedBusId = form.assigned_bus ? Number(form.assigned_bus) : null;
  const selectedBus = useMemo(
    () => buses.find((b) => b.bus_id === selectedBusId),
    [buses, selectedBusId],
  );
  const busTakenByOtherDriver = Boolean(
    driver &&
      selectedBus?.assigned_driver &&
      selectedBus.assigned_driver.driver_id !== driver.driver_id
  );
  const busLineWarning = Boolean(selectedBus?.active_line);

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
        portal_password: "",
      });
      setError("");
      setShowStoredPassword(false);
      setShowNewPortalPassword(false);
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
    const phoneRes = normalizePhoneFlexible(form.phone);
    if (!phoneRes.ok) {
      setError(phoneRes.message);
      return;
    }
    if (busTakenByOtherDriver && selectedBus?.assigned_driver) {
      setError(
        `Bus ${selectedBus.registration_number} is already assigned to ${selectedBus.assigned_driver.name}. Each bus can only have one driver.`
      );
      return;
    }
    setError("");

    patchDriver(
      {
        id: driver.driver_id,
        data: {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: phoneRes.normalized,
          license_number: form.license_number,
          assigned_bus: form.assigned_bus ? Number(form.assigned_bus) : null,
          is_active: form.is_active,
          ...(form.portal_password.trim()
            ? { portal_password: form.portal_password.trim() }
            : {}),
        },
      },
      {
        onSuccess: () => onClose(),
        onError: (err) =>
          setError(
            pickFirstApiError(err, "Failed to update driver. Check for duplicate email or license number.")
          ),
      }
    );
  };

  if (!driver) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Driver">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        {driver && selectedBus && busTakenByOtherDriver && selectedBus.assigned_driver && (
          <div className={styles.dangerBanner}>
            This bus is already assigned to driver <strong>{selectedBus.assigned_driver.name}</strong>. Choose a
            different bus or unassign the other driver first.
          </div>
        )}
        {selectedBus && busLineWarning && selectedBus.active_line && (
          <div className={styles.warnBanner}>
            This bus has an active line assignment: <strong>{selectedBus.active_line.name}</strong>. Confirm this
            matches your operations before saving.
          </div>
        )}

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
            placeholder="5551234567 or +15551234567"
          />
          <p className={styles.hint}>
            Use 10 digits without country code, or international format with + and country code.
          </p>
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
                {b.assigned_driver && b.assigned_driver.driver_id !== driver.driver_id ? " — already has driver" : ""}
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

        <div className={styles.field}>
          <label className={styles.label}>Stored driver portal password</label>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
            Plaintext copy for office reference (same as the drivers list).
          </p>
          <div className={styles.passwordRow}>
            <input
              readOnly
              type={showStoredPassword ? "text" : "password"}
              className={styles.readOnlyInput}
              value={driver.password ?? ""}
              placeholder="—"
              aria-label="Stored driver portal password"
            />
            <button
              type="button"
              className={styles.togglePw}
              onClick={() => setShowStoredPassword((v) => !v)}
            >
              {showStoredPassword ? "Hide" : "Show"}
            </button>
          </div>
          {!driver.password?.trim() && (
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No password on file yet.</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>New driver portal password (optional)</label>
          <div className={styles.passwordRow}>
            <input
              type={showNewPortalPassword ? "text" : "password"}
              className={styles.input}
              value={form.portal_password}
              onChange={(e) => setForm((f) => ({ ...f, portal_password: e.target.value }))}
              placeholder={driver.has_portal_account ? "Leave blank to keep current" : "Set to enable driver portal login"}
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.togglePw}
              onClick={() => setShowNewPortalPassword((v) => !v)}
            >
              {showNewPortalPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isPending || busTakenByOtherDriver}
          >
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
