"use client";

import { useState } from "react";
import type { StudentDetail } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { useStudentSubscriptions, useAssignStudentLine } from "@/hooks/useSubscriptions";
import { usePatchStudent, useDeleteStudent } from "@/hooks/useStudents";
import { useLines } from "@/hooks/useLines";
import styles from "./StudentDetail.module.css";

interface StudentDetailPanelProps {
  student: StudentDetail;
  onClose: () => void;
  onDeleted?: () => void;
}

export function StudentDetailPanel({ student, onClose, onDeleted }: StudentDetailPanelProps) {
  const fullName = `${student.first_name} ${student.last_name}`;
  const studentId = `STU${String(student.student_id).padStart(3, "0")}`;
  const isActive = student.user?.is_active !== false;

  const { data: subscriptions, isLoading: subsLoading } = useStudentSubscriptions(student.student_id);
  const { mutate: patchStudent, isPending: isSaving } = usePatchStudent();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
  const { mutateAsync: assignLine } = useAssignStudentLine();
  const { data: linesData } = useLines();
  const lines = linesData?.results ?? [];

  const activeSubscription = subscriptions?.find((s) => s.is_active);

  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    first_name: student.first_name,
    last_name: student.last_name,
    email: student.email,
    phone: student.phone ?? "",
    registration_number: student.registration_number,
    line_id: activeSubscription ? String(activeSubscription.line) : "",
  });
  const [editError, setEditError] = useState("");
  const subscriptionHistory = subscriptions ?? [];

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setEditError("Name is required.");
      return;
    }
    if (!form.email.trim()) {
      setEditError("Email is required.");
      return;
    }
    setEditError("");

    const currentLineId = activeSubscription ? String(activeSubscription.line) : "";
    const lineChanged = form.line_id !== currentLineId;

    try {
      await new Promise<void>((resolve, reject) => {
        patchStudent(
          {
            id: student.student_id,
            data: {
              first_name: form.first_name,
              last_name: form.last_name,
              email: form.email,
              phone: form.phone,
              registration_number: form.registration_number,
            },
          },
          { onSuccess: () => resolve(), onError: reject }
        );
      });

      if (lineChanged && form.line_id) {
        await assignLine({ studentId: student.student_id, lineId: Number(form.line_id) });
      }

      setEditing(false);
    } catch {
      setEditError("Failed to save. Check for duplicate email or registration number.");
    }
  };

  const handleDelete = () => {
    if (!confirm(`Delete student "${fullName}"? This cannot be undone.`)) return;
    deleteStudent(student.student_id, {
      onSuccess: () => {
        onClose();
        onDeleted?.();
      },
      onError: () => alert("Failed to delete student."),
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.name}>{editing ? `${form.first_name} ${form.last_name}` : fullName}</h2>
          <span className={styles.id}>{studentId}</span>
        </div>
        <div className={styles.headerActions}>
          {!editing && (
            <>
              <button
                className={styles.editBtn}
                onClick={() => {
                  setForm({
                    first_name: student.first_name,
                    last_name: student.last_name,
                    email: student.email,
                    phone: student.phone ?? "",
                    registration_number: student.registration_number,
                    line_id: activeSubscription ? String(activeSubscription.line) : "",
                  });
                  setEditError("");
                  setEditing(true);
                }}
              >
                Edit
              </button>
              <button
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {editing ? (
        <div className={styles.editForm}>
          <h3 className={styles.sectionTitle}>Edit Student</h3>
          {editError && <div className={styles.editError}>{editError}</div>}
          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>First Name</label>
              <input
                className={styles.editInput}
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Last Name</label>
              <input
                className={styles.editInput}
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Email</label>
            <input
              className={styles.editInput}
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Phone</label>
            <input
              className={styles.editInput}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. +1234567890"
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Registration Number</label>
            <input
              className={styles.editInput}
              value={form.registration_number}
              onChange={(e) => setForm((f) => ({ ...f, registration_number: e.target.value }))}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Assigned Line</label>
            <select
              className={styles.editInput}
              value={form.line_id}
              onChange={(e) => setForm((f) => ({ ...f, line_id: e.target.value }))}
            >
              <option value="">No line assigned</option>
              {lines.map((l) => (
                <option key={l.line_id} value={l.line_id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.editActions}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button className={styles.cancelEditBtn} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Personal Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{student.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone:</span>
                <span className={styles.infoValue}>{student.phone || "—"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Reg. Number:</span>
                <span className={styles.infoValue}>{student.registration_number}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Assigned Line:</span>
                <span className={styles.infoValue}>
                  {activeSubscription ? activeSubscription.line_detail?.name ?? "—" : "—"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Password:</span>
                <span className={styles.infoValue} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "monospace", letterSpacing: showPassword ? "normal" : 2 }}>
                    {student.password
                      ? showPassword
                        ? student.password
                        : "•".repeat(Math.min(student.password.length, 12))
                      : "—"}
                  </span>
                  {student.password && (
                    <button
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--color-muted)", display: "flex", alignItems: "center" }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  )}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Account Status:</span>
                <Badge variant={isActive ? "active" : "expired"}>
                  {isActive ? "active" : "inactive"}
                </Badge>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Active Subscription:</span>
                {activeSubscription ? (
                  <Badge variant="active">active</Badge>
                ) : (
                  <Badge variant="expired">none</Badge>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Subscription History</h3>
            {subsLoading ? (
              <p className={styles.empty}>Loading...</p>
            ) : subscriptionHistory.length === 0 ? (
              <p className={styles.empty}>No subscription history available.</p>
            ) : (
              <div className={styles.subList}>
                {subscriptionHistory.map((sub) => (
                  <div key={sub.subscription_id} className={styles.subItem}>
                    <div className={styles.subInfo}>
                      <span className={styles.subLine}>{sub.line_detail?.name ?? `Line #${sub.line}`}</span>
                      <span className={styles.subDate}>
                        {new Date(sub.start_date).toLocaleDateString()}
                        {sub.end_date ? ` – ${new Date(sub.end_date).toLocaleDateString()}` : ""}
                      </span>
                    </div>
                    <Badge variant={sub.is_active ? "active" : "expired"}>
                      {sub.is_active ? "active" : "expired"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
