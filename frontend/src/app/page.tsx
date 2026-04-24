"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

/* ── Inline SVG icon library ── */
const HomeIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const InfoIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.5" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

const ShieldNavIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" />
  </svg>
);

const MailIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const BusIcon = ({ size = 22, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="19" r="1.5" fill={color} stroke="none" />
    <circle cx="17" cy="19" r="1.5" fill={color} stroke="none" />
    <path d="M6 5V3" /><path d="M18 5V3" />
  </svg>
);

const RouteIcon = ({ size = 22, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);

const StudentsIcon = ({ size = 22, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3" />
    <path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
    <circle cx="17" cy="7" r="2.5" />
    <path d="M22 20c0-2.76-2.24-5-5-5" />
  </svg>
);

const ReportsIcon = ({ size = 22, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 17V13" /><path d="M12 17V9" /><path d="M16 17V11" />
  </svg>
);

const CalendarIcon = ({ size = 22, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
    <path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" />
    <path d="M8 18h.01" /><path d="M12 18h.01" />
  </svg>
);

const ShieldIcon = ({ size = 28, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" />
  </svg>
);

const ArrowRightIcon = ({ size = 14, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
  </svg>
);

const LoginIcon = ({ size = 15, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

/* ── Nav items config ── */
const navItems = [
  { id: "home",     label: "Home",     Icon: HomeIcon,     href: "#home" },
  { id: "about",    label: "About",    Icon: InfoIcon,     href: "#about" },
  { id: "features", label: "Features", Icon: ShieldNavIcon,href: "#features" },
  { id: "contact",  label: "Contact",  Icon: MailIcon,     href: "#contact" },
];

const stats = [
  { Icon: BusIcon,      value: "45",    label: "Total Buses",      sub: "Active in the system" },
  { Icon: RouteIcon,    value: "18",    label: "Transport Lines",  sub: "Across all campuses" },
  { Icon: StudentsIcon, value: "3,842", label: "Students",         sub: "Using transport services" },
  { Icon: CalendarIcon, value: "126",   label: "Daily Trips",      sub: "Scheduled today" },
];

const features = [
  { Icon: BusIcon,      title: "Fleet Management",    desc: "Manage buses, capacity and assignments." },
  { Icon: RouteIcon,    title: "Route & Schedule",    desc: "Organize routes, schedules and trips." },
  { Icon: StudentsIcon, title: "Student Management",  desc: "Manage subscriptions, assignments and history." },
  { Icon: ReportsIcon,  title: "Reports & Analytics", desc: "Get real-time insights and system reports." },
];

/* ── Page ── */
export default function LandingPage() {
  const [activeNav, setActiveNav] = useState("home");

  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <div className={styles.navLogoWrap}>
            <Image src="/bus-logo.png" alt="UNITRANS logo" width={40} height={40} />
          </div>
          <div>
            <span className={styles.navTitle}>UNITRANS</span>
            <span className={styles.navSub}>Transport Management System</span>
          </div>
        </div>

        <ul className={styles.navLinks}>
          {navItems.map(({ id, label, Icon, href }) => (
            <li key={id}>
              <a
                href={href}
                className={`${styles.navLink} ${activeNav === id ? styles.navLinkActive : ""}`}
                onClick={() => setActiveNav(id)}
              >
                <Icon size={15} color="currentColor" />
                {label}
              </a>
            </li>
          ))}
        </ul>

        <Link href="/login" className={styles.navBtn}>
          <LoginIcon size={15} color="#fff" /> Manager Login
        </Link>
      </nav>

      {/* ── Hero — full-bleed image with text overlay ── */}
      <section className={styles.hero} id="home">
        {/* background image fills the whole section */}
        <div className={styles.heroBgImage}>
          <Image
            src="/bus-hero.png"
            alt="University bus"
            fill
            className={styles.heroBgImg}
            priority
            sizes="100vw"
          />
          {/* left-to-right white fade overlay */}
          <div className={styles.heroFadeOverlay} />
        </div>

        {/* text content sits above the image */}
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>TRANSPORT MANAGER PORTAL</span>
          <h1 className={styles.heroTitle}>
            Manage. Monitor.<br />
            <span className={styles.heroTitleBlue}>Move Forward.</span>
          </h1>
          <p className={styles.heroDesc}>
            UNITRANS helps you efficiently manage university transportation
            operations, buses, routes, schedules and students – all in
            one intelligent system.
          </p>
          <div className={styles.heroFeatures} id="features">
            {features.map((f) => (
              <div key={f.title} className={styles.heroFeatureItem}>
                <span className={styles.heroFeatureIcon}>
                  <f.Icon size={20} color="#1a56db" />
                </span>
                <div>
                  <div className={styles.heroFeatureTitle}>{f.title}</div>
                  <div className={styles.heroFeatureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.statsBar} id="about">
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <s.Icon size={26} color="#1a56db" />
            </div>
            <div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statSub}>{s.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaLeft}>
          <div className={styles.ctaShieldWrap}>
            <ShieldIcon size={28} color="#ffffff" />
          </div>
          <div>
            <div className={styles.ctaTitle}>Secure. Reliable. Efficient.</div>
            <div className={styles.ctaDesc}>
              UNITRANS is designed to make transportation management smarter and safer for everyone.
            </div>
          </div>
        </div>
        <div className={styles.ctaSeparator} />
        <div className={styles.ctaRight}>
          <div className={styles.ctaRightText}>
            <div className={styles.ctaRightTitle}>Ready to access the portal?</div>
            <div className={styles.ctaRightDesc}>
              Log in to manage operations, track performance and ensure smooth transportation services.
            </div>
          </div>
          <Link href="/login" className={styles.ctaBtn}>
            <LoginIcon size={15} color="#1e3a8a" /> Manager Login <ArrowRightIcon size={13} color="#1e3a8a" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer} id="contact">
        <p>© 2026 UNITRANS – University Transportation Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
