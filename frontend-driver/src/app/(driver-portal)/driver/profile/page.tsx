"use client";

import { useEffect, useState, FormEvent } from "react";
import { getDriverMe, patchDriverMe } from "@/api/modules/driver/driver.api";
import type { DriverMe } from "@/api/modules/driver/driver.api";
import { useDriverAuth } from "@/context/DriverAuthContext";
import { normalizePhoneFlexible } from "@/lib/phone";
import { pickFirstApiError } from "@/lib/apiError";
import styles from "../subpage.module.css";

export default function DriverProfilePage() {
  const { user } = useDriverAuth();
  const [profile, setProfile] = useState<DriverMe | null>(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getDriverMe()
      .then((r) => {
        setProfile(r.data);
        setForm({
          first_name: r.data.first_name,
          last_name: r.data.last_name,
          phone: r.data.phone ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const phoneRes = normalizePhoneFlexible(form.phone);
    if (!phoneRes.ok) {
      setError(phoneRes.message);
      return;
    }
    setSaving(true);
    try {
      const r = await patchDriverMe({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: phoneRes.normalized,
      });
      setProfile(r.data);
      setSuccess(true);
    } catch (err) {
      setError(pickFirstApiError(err, "Could not update profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}><div className={styles.spinner} /></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.pageSub}>Update your contact details (email is managed by your office)</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Account</div>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Signed in as</span>
            <span className={styles.detailValue}>{user?.email}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>License</span>
            <span className={styles.detailValue}>{profile?.license_number ?? "—"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Email (read-only)</span>
            <span className={styles.detailValue}>{profile?.email ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Edit profile</div>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>Profile updated.</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fn">First name</label>
            <input
              id="fn"
              className={styles.input}
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ln">Last name</label>
            <input
              id="ln"
              className={styles.input}
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ph">Phone</label>
            <input
              id="ph"
              className={styles.input}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="5551234567 or +15551234567"
            />
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
              10 digits without country code, or + with country code.
            </p>
          </div>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
