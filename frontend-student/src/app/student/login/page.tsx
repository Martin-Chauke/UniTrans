"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStudentAuth } from "@/context/StudentAuthContext";
import { resetPassword } from "@/api/modules/student/student.api";
import styles from "./login.module.css";

/* ── Icons ── */
const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const CreditCardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
  </svg>
);
const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const PersonIcon = ({ color = "#9ca3af" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>
);
const LockIcon = ({ color = "#9ca3af" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const EyeIcon = ({ color = "#9ca3af" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = ({ color = "#9ca3af" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const SignInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);
const GraduationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
  </svg>
);

const features = [
  { Icon: CalendarIcon, title: "View Schedules",      desc: "Check bus timings and routes" },
  { Icon: MapPinIcon,   title: "Track Your Route",    desc: "Know your line, station and next bus" },
  { Icon: CreditCardIcon, title: "Manage Subscription", desc: "View, renew and manage your subscription" },
  { Icon: BellIcon,     title: "Stay Updated",        desc: "Get real-time alerts and notifications" },
];

export default function StudentLoginPage() {
  const { login, isAuthenticated, isLoading } = useStudentAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/student/dashboard");
  }, [isAuthenticated, isLoading, router]);

  /* ── Login state ── */
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  /* ── Reset modal state ── */
  const [showReset, setShowReset]     = useState(false);
  const [resetEmail, setResetEmail]   = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd]   = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [resetError, setResetError]   = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const openReset = () => {
    setResetEmail(email); // pre-fill if already typed
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetSuccess(false);
    setShowReset(true);
  };

  const closeReset = () => {
    setShowReset(false);
    setResetSuccess(false);
    setResetError("");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password)     { setError("Password is required."); return; }
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("students only")) {
        setError("Access denied: this portal is for students only.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (!resetEmail.trim()) { setResetError("Email is required."); return; }
    if (!newPassword)       { setResetError("New password is required."); return; }
    if (newPassword !== confirmPassword) { setResetError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setResetError("Password must be at least 8 characters."); return; }
    setResetLoading(true);
    try {
      await resetPassword({
        email: resetEmail.trim(),
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setResetSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      const data = axiosErr?.response?.data;
      if (data && typeof data === "object") {
        const msgs = Object.values(data as Record<string, string | string[]>)
          .map((v) => (Array.isArray(v) ? v.join(" ") : v))
          .join("  ");
        setResetError(msgs || "Failed to reset password.");
      } else {
        setResetError("Failed to reset password. Please check your email and try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ── LEFT panel ── */}
      <div className={styles.leftPanel}>
        <div className={styles.busImageWrap}>
          <Image src="/bus2.png" alt="University bus" fill className={styles.busImage} priority sizes="48vw" />
        </div>
        <div className={styles.leftGradient} />

        <div className={styles.leftContent}>
          <div className={styles.logoCircle}>
            <Image src="/bus-logo-new.png" alt="UNITRANS logo" width={52} height={52} />
          </div>
          <h1 className={styles.brand}>UNITRANS</h1>
          <p className={styles.brandSub}>University Transport System</p>
          <div className={styles.brandRule} />
          <h2 className={styles.portalLabel}>Student Portal</h2>
          <p className={styles.portalDesc}>
            Your smart way to view your transport details, schedules, manage subscriptions and stay updated.
          </p>
        </div>

        <div className={styles.featureStrip}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureItem}>
              <div className={styles.featureIconWrap}><f.Icon /></div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT panel ── */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Welcome Back!</h2>
          <p className={styles.cardSub}>Sign in to your student account</p>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Username or Email</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><PersonIcon /></span>
                <input
                  id="email" type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={styles.input} placeholder="Enter your username or email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  id="password" type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputToggle} placeholder="Enter your password"
                  disabled={loading}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className={styles.row}>
              <label className={styles.checkLabel}>
                <input type="checkbox" className={styles.checkbox} />
                Remember me
              </label>
              <button type="button" className={styles.forgotLink} onClick={openReset}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <SignInIcon />
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className={styles.orRow}>
            <span className={styles.orLine} /><span className={styles.orText}>OR</span><span className={styles.orLine} />
          </div>

          <button type="button" className={styles.ssoBtn}>
            <GraduationIcon />
            Login with University Account
          </button>

          <div className={styles.secureNote}>
            <ShieldCheckIcon />
            <div>
              <div className={styles.secureTitle}>Accounts are issued by the transport office</div>
              <div className={styles.secureDesc}>Your login credentials are provided by the system administrator.</div>
            </div>
          </div>

          <div className={styles.noRegisterNote}>
            <span>No account?</span>{" "}
            Visit the <strong>University Transport Center</strong> to get your credentials.
          </div>
        </div>
      </div>

      {/* ── Reset Password Modal ── */}
      {showReset && (
        <div className={styles.modalOverlay} onClick={closeReset}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Reset Password</div>
                <div className={styles.modalSub}>Enter your email and choose a new password</div>
              </div>
              <button className={styles.modalClose} onClick={closeReset}><CloseIcon /></button>
            </div>

            {resetSuccess ? (
              <div className={styles.successState}>
                <CheckIcon />
                <div className={styles.successTitle}>Password updated!</div>
                <div className={styles.successDesc}>Your password has been changed successfully. You can now sign in with your new password.</div>
                <button className={styles.submitBtn} onClick={closeReset}>Back to Sign In</button>
              </div>
            ) : (
              <form onSubmit={handleReset} className={styles.form}>
                {resetError && <div className={styles.errorBanner}>{resetError}</div>}

                <div className={styles.field}>
                  <label className={styles.label}>Email address</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}><PersonIcon /></span>
                    <input
                      type="email" autoComplete="email"
                      value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      className={styles.input} placeholder="Your registered email"
                      disabled={resetLoading}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>New Password</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}><LockIcon /></span>
                    <input
                      type={showNewPwd ? "text" : "password"}
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.inputToggle} placeholder="Min. 8 characters"
                      disabled={resetLoading}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowNewPwd((v) => !v)} tabIndex={-1}>
                      {showNewPwd ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Confirm New Password</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}><LockIcon /></span>
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.inputToggle} placeholder="Repeat new password"
                      disabled={resetLoading}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPwd((v) => !v)} tabIndex={-1}>
                      {showConfirmPwd ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={resetLoading}>
                  {resetLoading ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
