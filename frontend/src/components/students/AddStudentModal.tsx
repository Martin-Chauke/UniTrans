"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useLines } from "@/hooks/useLines";
import { authApi } from "@/api";
import styles from "./AddStudentModal.module.css";

interface AddStudentModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddStudentModal({ open, onClose }: AddStudentModalProps) {
  const { data: linesData } = useLines();
  const lines = linesData?.results ?? [];

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    registration_number: "",
    line: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("Full name is required."); return;
    }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (!form.registration_number.trim()) { setError("Registration number is required."); return; }
    setError("");
    setLoading(true);
    const password = form.password || `Uni${Math.random().toString(36).slice(2, 10)}!`;
    try {
      await authApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        registration_number: form.registration_number,
        password,
        password_confirm: password,
      });
      setForm({ first_name: "", last_name: "", email: "", phone: "", registration_number: "", line: "", password: "" });
      onClose();
    } catch {
      setError("Failed to add student. Check for duplicate email or registration number.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ first_name: "", last_name: "", email: "", phone: "", registration_number: "", line: "", password: "" });
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Student">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>First Name <span className={styles.required}>*</span></label>
            <input type="text" className={styles.input} value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="First name" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Last Name <span className={styles.required}>*</span></label>
            <input type="text" className={styles.input} value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Last name" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email <span className={styles.required}>*</span></label>
          <input type="email" className={styles.input} value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="student@university.edu" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Phone</label>
          <input type="tel" className={styles.input} value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1234567890" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Registration Number <span className={styles.required}>*</span></label>
          <input type="text" className={styles.input} value={form.registration_number}
            onChange={(e) => setForm((f) => ({ ...f, registration_number: e.target.value }))} placeholder="e.g. STU006" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Assign Line</label>
          {lines.length === 0 ? (
            <div className={styles.noLinesWarning}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              No lines available yet.{" "}
              <a href="/lines-trips" className={styles.noLinesLink}>Go to Lines/Trips</a>{" "}
              to create one first.
            </div>
          ) : (
            <select className={styles.select} value={form.line}
              onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))}>
              <option value="">Select a line</option>
              {lines.map((l) => (
                <option key={l.line_id} value={l.line_id}>{l.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password <span style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 400 }}>(optional — auto-generated if blank)</span></label>
          <input type="password" className={styles.input} value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Leave blank to auto-generate" />
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Student"}
          </button>
          <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}
