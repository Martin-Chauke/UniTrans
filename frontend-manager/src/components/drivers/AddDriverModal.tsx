"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { useBuses } from "@/hooks/useBuses";
import { useCreateDriver } from "@/hooks/useDrivers";
import { normalizePhoneFlexible } from "@/lib/phone";
import { pickFirstApiError } from "@/lib/apiError";
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
    portal_password: "",
  });
  const [error, setError] = useState("");
  const [showPortalPassword, setShowPortalPassword] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createdPassword, setCreatedPassword] = useState("");

  const selectedBusId = form.assigned_bus ? Number(form.assigned_bus) : null;
  const selectedBus = useMemo(
    () => buses.find((b) => b.bus_id === selectedBusId),
    [buses, selectedBusId],
  );
  const busDriverConflict = Boolean(selectedBus?.assigned_driver);
  const busLineWarning = Boolean(selectedBus?.active_line);

  useEffect(() => {
    if (open) {
      setCreateSuccess(false);
      setCreatedPassword("");
      setShowPortalPassword(false);
      setError("");
    }
  }, [open]);

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
    const phoneRes = normalizePhoneFlexible(form.phone);
    if (!phoneRes.ok) {
      setError(phoneRes.message);
      return;
    }
    if (busDriverConflict && selectedBus?.assigned_driver) {
      setError(
        `Bus ${selectedBus.registration_number} is already assigned to ${selectedBus.assigned_driver.name}. Each bus can only have one driver.`
      );
      return;
    }
    setError("");

    createDriver(
      {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: phoneRes.normalized,
        license_number: form.license_number,
        assigned_bus: form.assigned_bus ? Number(form.assigned_bus) : null,
        ...(form.portal_password.trim()
          ? { portal_password: form.portal_password.trim() }
          : {}),
      },
      {
        onSuccess: (res) => {
          setCreateSuccess(true);
          setCreatedPassword(res.data.password ?? "");
        },
        onError: (err) => {
          setError(
            pickFirstApiError(
              err,
              "Failed to add driver. Check for duplicate email or license number."
            )
          );
        },
      }
    );
  };

  const handleClose = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      license_number: "",
      assigned_bus: "",
      portal_password: "",
    });
    setError("");
    setCreateSuccess(false);
    setCreatedPassword("");
    setShowPortalPassword(false);
    onClose();
  };

  const copyStored = async () => {
    if (!createdPassword) return;
    try {
      await navigator.clipboard.writeText(createdPassword);
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={createSuccess ? "Driver created" : "Add Driver"}
    >
      {createSuccess ? (
        <div className={styles.form}>
          <div className={styles.successPanel}>
            <strong>Stored driver portal password</strong>
            <span>This value is saved for manager reference and shown on the driver list and edit screen.</span>
            {createdPassword ? (
              <>
                <div className={styles.storedPw}>{createdPassword}</div>
                <button type="button" className={styles.copyBtn} onClick={copyStored}>
                  Copy password
                </button>
              </>
            ) : (
              <p style={{ marginTop: 8 }}>No portal password was set. You can add one when editing the driver.</p>
            )}
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.submitBtn} onClick={handleClose}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {selectedBus && busDriverConflict && selectedBus.assigned_driver && (
            <div className={styles.dangerBanner}>
              This bus is already assigned to driver{" "}
              <strong>{selectedBus.assigned_driver.name}</strong>. Choose a different bus or unassign the other driver
              first.
            </div>
          )}
          {selectedBus && busLineWarning && selectedBus.active_line && (
            <div className={styles.warnBanner}>
              This bus already has an active line assignment:{" "}
              <strong>{selectedBus.active_line.name}</strong>. A bus should only serve one line at a time — confirm this
              is intended.
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
              Use 10 digits without country code, or international format with + and country code (e.g. +1, +44).
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
                  {b.assigned_driver ? " — already has driver" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Driver portal password (optional)</label>
            <div className={styles.passwordRow}>
              <input
                type={showPortalPassword ? "text" : "password"}
                className={styles.input}
                value={form.portal_password}
                onChange={(e) => setForm((f) => ({ ...f, portal_password: e.target.value }))}
                placeholder="Set to allow login on driver portal (port 3002)"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.togglePw}
                onClick={() => setShowPortalPassword((v) => !v)}
              >
                {showPortalPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={isPending || busDriverConflict}>
              {isPending ? "Adding..." : "Add Driver"}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
