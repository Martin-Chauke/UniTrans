"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { getMyProfile, updateMyProfile } from "@/api/modules/student/student.api";
import { useStudentAuth } from "@/context/StudentAuthContext";
import { useStudentPhoto } from "@/hooks/useStudentPhoto";
import type { Student } from "@/api/types";
import styles from "../subpage.module.css";
import photoStyles from "./profile.module.css";

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function ProfilePage() {
  const { user } = useStudentAuth();
  const { photo, savePhoto, removePhoto } = useStudentPhoto();
  const [profile, setProfile] = useState<Student | null>(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", registration_number: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyProfile()
      .then(r => {
        setProfile(r.data);
        setForm({
          first_name: r.data.first_name,
          last_name: r.data.last_name,
          email: r.data.email,
          phone: r.data.phone ?? "",
          registration_number: r.data.registration_number,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Photo must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Resize to max 256×256 before saving to keep localStorage light
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 256;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        savePhoto(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const r = await updateMyProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || undefined,
        registration_number: form.registration_number,
      });
      setProfile(r.data);
      setSuccess(true);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: unknown } };
      const data = axiosError.response?.data;
      if (data && typeof data === "object") {
        const msgs = Object.values(data as Record<string, string[]>).flat();
        setError(msgs.join(" ") || "Update failed.");
      } else {
        setError("Update failed. Please try again.");
      }
    } finally { setSaving(false); }
  };

  const initials = (form.first_name || user?.name || "S")[0].toUpperCase();

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile Settings</h1>
        <p className={styles.pageSub}>View and update your personal information</p>
      </div>

      <div className={styles.grid2}>
        {/* ── Left: Account Info + Photo ── */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Account Info</div>

          <div className={photoStyles.avatarSection}>
            {/* Avatar circle */}
            <div className={photoStyles.avatarWrap}>
              {photo ? (
                <img src={photo} alt="Profile" className={photoStyles.avatarImg} />
              ) : (
                <div className={photoStyles.avatarInitials}>{initials}</div>
              )}
              {/* Camera overlay button */}
              <button
                type="button"
                className={photoStyles.cameraBtn}
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo"
              >
                <CameraIcon />
              </button>
            </div>

            <div className={photoStyles.avatarMeta}>
              <div className={photoStyles.avatarName}>{form.first_name} {form.last_name}</div>
              <div className={photoStyles.avatarEmail}>{form.email}</div>
              <span className={styles.badgeBlue}>Student</span>
            </div>
          </div>

          {/* Photo action buttons */}
          <div className={photoStyles.photoActions}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              className={photoStyles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraIcon />
              {photo ? "Change Photo" : "Upload Photo"}
            </button>
            {photo && (
              <button
                type="button"
                className={photoStyles.removeBtn}
                onClick={removePhoto}
                title="Remove photo"
              >
                <TrashIcon />
                Remove
              </button>
            )}
          </div>

          {photoError && (
            <div className={styles.errorBanner} style={{ marginTop: 0 }}>{photoError}</div>
          )}

          <p className={photoStyles.photoHint}>
            JPG, PNG or GIF · Max 2 MB · Resized to 256×256
          </p>

          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Registration Number</div>
              <div className={styles.detailValue}>{profile?.registration_number ?? "—"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Student ID</div>
              <div className={styles.detailValue}>#{profile?.student_id ?? "—"}</div>
            </div>
          </div>
        </div>

        {/* ── Right: Edit form ── */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Edit Profile</div>
          {success && <div className={styles.successBanner}>Profile updated successfully!</div>}
          {error && <div className={styles.errorBanner}>{error}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={styles.field}>
                <label className={styles.label}>First Name</label>
                <input className={styles.input} value={form.first_name} onChange={set("first_name")} required disabled={saving} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last Name</label>
                <input className={styles.input} value={form.last_name} onChange={set("last_name")} required disabled={saving} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Registration Number</label>
              <input className={styles.input} value={form.registration_number} onChange={set("registration_number")} required disabled={saving} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" value={form.email} onChange={set("email")} required disabled={saving} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone (optional)</label>
              <input className={styles.input} value={form.phone} onChange={set("phone")} disabled={saving} />
            </div>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
