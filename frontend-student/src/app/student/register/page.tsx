"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

export default function StudentRegisterPage() {
  return (
    <div className={styles.page}>
      {/* LEFT — same bus photo panel as login */}
      <div className={styles.leftPanel}>
        <div className={styles.busImageWrap}>
          <Image
            src="/bus2.png"
            alt="University bus"
            fill
            className={styles.busImage}
            priority
            sizes="42vw"
          />
        </div>
        <div className={styles.leftGradient} />

        <div className={styles.leftContent}>
          <div className={styles.logoCircle}>
            <Image src="/bus-logo-new.png" alt="UNITRANS logo" width={44} height={44} />
          </div>
          <h1 className={styles.brand}>UNITRANS</h1>
          <p className={styles.brandSub}>University Transport System</p>
          <div className={styles.brandRule} />
          <h2 className={styles.portalLabel}>Student Portal</h2>
          <p className={styles.portalDesc}>
            Access your transport details, schedules, manage subscriptions and stay updated.
          </p>

          <div className={styles.steps}>
            {[
              "Visit the University Transport Center",
              "Provide your student ID to the administrator",
              "Receive your login credentials",
              "Sign in and access your portal",
            ].map((s, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — info panel, no form */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>

          <div className={styles.iconWrap}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>

          <h2 className={styles.cardTitle}>Account Registration</h2>
          <p className={styles.cardSub}>Student accounts are not self-registered</p>

          <div className={styles.infoSection}>
            <p className={styles.infoText}>
              Student accounts on UNITRANS are <strong>created by your transport manager</strong>.
              You cannot sign up on your own — your credentials are assigned to you by your institution.
            </p>

            <div className={styles.stepCard}>
              <div className={styles.stepCardTitle}>How to get your account</div>
              <ol className={styles.stepList}>
                <li>Visit the <strong>University Transport System Center</strong> on campus</li>
                <li>Present your valid <strong>student ID card</strong></li>
                <li>The administrator will create your account and provide your <strong>email and password</strong></li>
                <li>Return to the <Link href="/student/login" className={styles.link}>login page</Link> and sign in</li>
              </ol>
            </div>

            <div className={styles.forgotBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="3" />
                <line x1="12" y1="12" x2="12" y2="16" />
              </svg>
              <div>
                <div className={styles.forgotTitle}>Forgot your password?</div>
                <div className={styles.forgotDesc}>
                  Contact your transport manager or visit the <strong>University Transport Center</strong> to have your password reset.
                </div>
              </div>
            </div>
          </div>

          <Link href="/student/login" className={styles.backBtn}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
