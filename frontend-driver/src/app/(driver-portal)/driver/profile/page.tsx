"use client";

import { useEffect, useState, useMemo, FormEvent } from "react";
import { getDriverMe, patchDriverMe } from "@/api/modules/driver/driver.api";
import type { DriverMe } from "@/api/modules/driver/driver.api";
import { useDriverAuth } from "@/context/DriverAuthContext";
import { normalizePhoneFlexible } from "@/lib/phone";
import { pickFirstApiError } from "@/lib/apiError";
import styles from "../subpage.module.css";

/** Max stored length: '+' + 15 digits (E.164) plus small paste buffer. */
const PHONE_INPUT_MAX_LEN = 28;

export default function DriverProfilePage() {
  const { user, refreshProfile } = useDriverAuth();
  const [profile, setProfile] = useState<DriverMe | null>(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const phoneCheck = useMemo(() => normalizePhoneFlexible(form.phone), [form.phone]);
  const phoneTrimmed = form.phone.trim();
  const phoneHasInput = phoneTrimmed.length > 0;
  const phoneInvalid = phoneHasInput && !phoneCheck.ok;

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
      await refreshProfile();
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
              onChange={(e) => {
                setForm((f) => ({ ...f, first_name: e.target.value }));
                setSuccess(false);
              }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ln">Last name</label>
            <input
              id="ln"
              className={styles.input}
              value={form.last_name}
              onChange={(e) => {
                setForm((f) => ({ ...f, last_name: e.target.value }));
                setSuccess(false);
              }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ph">Phone</label>
            <input
              id="ph"
              className={`${styles.input} ${phoneInvalid ? styles.inputInvalid : ""}`}
              value={form.phone}
              onChange={(e) => {
                const v = e.target.value.slice(0, PHONE_INPUT_MAX_LEN);
                setForm((f) => ({ ...f, phone: v }));
                setSuccess(false);
                setError("");
              }}
              placeholder="5551234567 or +15551234567"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={phoneInvalid}
              aria-describedby="phone-hint phone-live"
            />
            <p id="phone-hint" className={styles.hintMuted}>
              Without +, enter exactly 10 digits (spaces/formatting ignored). With +, enter 8–15 digits after +
              (country code included in that count). Leave blank to clear your number.
            </p>
            <div id="phone-live" role="status" aria-live="polite">
              {phoneHasInput && phoneInvalid && (
                <p className={styles.phoneInlineError}>{phoneCheck.message}</p>
              )}
              {phoneHasInput && phoneCheck.ok && (
                <p className={styles.phoneInlineOk}>
                  Format OK — will be saved as: {phoneCheck.normalized || "(cleared)"}
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={saving || phoneInvalid}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
