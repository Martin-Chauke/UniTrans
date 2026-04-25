"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import styles from "./register.module.css";

/* ── SVG Icons ── */
const PersonIcon = ({ size = 18, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>
);

const MailIcon = ({ size = 18, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const LockIcon = ({ size = 18, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const EyeIcon = ({ size = 18, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 18, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ShieldIcon = ({ size = 20, color = "#132a5c" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" />
  </svg>
);

const BarChartIcon = ({ size = 18, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 17V13" /><path d="M12 17V9" /><path d="M16 17V11" />
  </svg>
);

const PeopleIcon = ({ size = 18, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3" />
    <path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
    <circle cx="17" cy="7" r="2.5" />
    <path d="M22 20c0-2.76-2.24-5-5-5" />
  </svg>
);

const CheckIcon = ({ size = 16, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function RegisterPage() {
  const { isAuthenticated, isLoading, registerManager } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim())               { setError("Full name is required."); return; }
    if (!email.trim())              { setError("Email is required."); return; }
    if (!password)                  { setError("Password is required."); return; }
    if (password.length < 8)        { setError("Password must be at least 8 characters."); return; }
    if (password !== passwordConfirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await registerManager({ name, email, password, password_confirm: passwordConfirm });
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, unknown> } };
      if (axiosErr?.response?.data) {
        const data = axiosErr.response.data;
        const firstMsg = Object.values(data).flat()[0];
        setError(typeof firstMsg === "string" ? firstMsg : "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ══ LEFT ══ */}
      <div className={styles.leftPanel}>
        <div className={styles.leftOverlay} />
        <div className={styles.leftContent}>
          <div className={styles.logoCircle}>
            <img src="/bus-logo.png" alt="UNITRANS" className={styles.logoImg} />
          </div>
          <h1 className={styles.brand}>UNITRANS</h1>
          <p className={styles.brandSub}>Transport Management System</p>
          <div className={styles.brandRule} />
          <h2 className={styles.portalLabel}>Manager Portal</h2>
          <p className={styles.portalDesc}>
            Create your account to start managing university transportation operations.
          </p>

          <div className={styles.badges}>
            <div className={styles.badge}>
              <div className={styles.badgeIcon}><ShieldIcon size={18} color="#fff" /></div>
              <div>
                <div className={styles.badgeTitle}>Secure Access</div>
                <div className={styles.badgeDesc}>Protected login for authorized managers</div>
              </div>
            </div>
            <div className={styles.badge}>
              <div className={styles.badgeIcon}><BarChartIcon size={18} /></div>
              <div>
                <div className={styles.badgeTitle}>Real-time Insights</div>
                <div className={styles.badgeDesc}>Monitor operations and performance instantly</div>
              </div>
            </div>
            <div className={styles.badge}>
              <div className={styles.badgeIcon}><PeopleIcon size={18} /></div>
              <div>
                <div className={styles.badgeTitle}>Efficient Management</div>
                <div className={styles.badgeDesc}>Manage routes, buses, schedules and more</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — floating card ══ */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create Manager Account</h2>
          <p className={styles.cardSub}>Register your manager account to get started</p>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Full Name</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><PersonIcon /></span>
                <input id="name" type="text" autoComplete="name" value={name}
                  onChange={(e) => setName(e.target.value)} className={styles.input}
                  placeholder="Enter your full name" disabled={loading} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email Address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><MailIcon /></span>
                <input id="email" type="email" autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} className={styles.input}
                  placeholder="Enter your email address" disabled={loading} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input id="password" type={showPassword ? "text" : "password"}
                  autoComplete="new-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} className={styles.inputToggle}
                  placeholder="Create a password (min. 8 chars)" disabled={loading} />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="passwordConfirm">Confirm Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input id="passwordConfirm" type={showConfirm ? "text" : "password"}
                  autoComplete="new-password" value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)} className={styles.inputToggle}
                  placeholder="Confirm your password" disabled={loading} />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <CheckIcon />
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className={styles.switchLine}>
            Already have an account?{" "}
            <Link href="/login" className={styles.switchLink}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
