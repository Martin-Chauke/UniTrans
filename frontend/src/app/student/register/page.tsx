"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStudentAuth } from "@/context/StudentAuthContext";
import styles from "./register.module.css";

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const EyeIcon = ({ show }: { show: boolean }) => show ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const HashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export default function StudentRegisterPage() {
  const { register } = useStudentAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    registration_number: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => router.push("/student/login"), 2000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: unknown } };
      const data = axiosError.response?.data;
      if (data && typeof data === "object") {
        const msgs = Object.values(data as Record<string, string[]>).flat();
        setError(msgs.join(" ") || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* LEFT */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.logoCircle}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="5" width="22" height="13" rx="3" />
              <path d="M1 10h22" />
              <circle cx="5.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" />
            </svg>
          </div>
          <h1 className={styles.brand}>UNITRANS</h1>
          <p className={styles.brandSub}>University Transport System</p>
          <div className={styles.brandRule} />
          <h2 className={styles.portalLabel}>Join the Student Portal</h2>
          <p className={styles.portalDesc}>
            Create your account to access your assigned transport details, view schedules, manage subscriptions and receive real-time alerts.
          </p>
          <div className={styles.steps}>
            {["Fill in your details", "Verify your account", "Access your portal"].map((s, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create Account</h2>
          <p className={styles.cardSub}>Register your student account</p>

          {success && (
            <div className={styles.successBanner}>
              Account created successfully! Redirecting to login…
            </div>
          )}
          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>First Name</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><PersonIcon /></span>
                  <input className={styles.input} placeholder="First name" value={form.first_name} onChange={set("first_name")} required disabled={loading} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last Name</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><PersonIcon /></span>
                  <input className={styles.input} placeholder="Last name" value={form.last_name} onChange={set("last_name")} required disabled={loading} />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Registration Number</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><HashIcon /></span>
                <input className={styles.input} placeholder="e.g. STU-2024-0012" value={form.registration_number} onChange={set("registration_number")} required disabled={loading} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><MailIcon /></span>
                <input className={styles.input} type="email" placeholder="student@university.dz" value={form.email} onChange={set("email")} required disabled={loading} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phone (optional)</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><PhoneIcon /></span>
                <input className={styles.input} placeholder="+213..." value={form.phone} onChange={set("phone")} disabled={loading} />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><LockIcon /></span>
                  <input className={styles.inputToggle} type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={set("password")} required disabled={loading} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><LockIcon /></span>
                  <input className={styles.inputToggle} type={showConfirm ? "text" : "password"} placeholder="Confirm" value={form.password_confirm} onChange={set("password_confirm")} required disabled={loading} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading || success}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className={styles.switchLine}>
            Already have an account?{" "}
            <Link href="/student/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
