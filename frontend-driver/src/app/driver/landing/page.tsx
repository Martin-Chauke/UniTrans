"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./landing.module.css";

/* ── SVG Icons ── */
const HomeIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const ServicesIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="17" r="1" fill={color} stroke="none" />
    <circle cx="17" cy="17" r="1" fill={color} stroke="none" />
  </svg>
);

const SchedulesIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const AboutIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.5" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

const HelpIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12" y2="17.01" strokeWidth="2.5" />
  </svg>
);

const LoginIcon = ({ size = 15, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const CalendarFeatureIcon = ({ size = 24, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const RouteFeatureIcon = ({ size = 24, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="3" />
  </svg>
);

const NotifyIcon = ({ size = 24, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const BusStatIcon = ({ size = 26, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="19" r="1.5" fill={color} stroke="none" />
    <circle cx="17" cy="19" r="1.5" fill={color} stroke="none" />
    <path d="M6 5V3M18 5V3" />
  </svg>
);

const SearchIcon = ({ size = 15, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const MapPinSmall = ({ size = 16, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowRightIcon = ({ size = 14, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ShieldFooterIcon = ({ size = 14, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const HeartIcon = ({ size = 13, color = "#1a56db" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/* ── Data ── */
const navItems = [
  { id: "home",      label: "Home",      Icon: HomeIcon,      href: "#home" },
  { id: "services",  label: "Services",  Icon: ServicesIcon,  href: "#services" },
  { id: "schedules", label: "Schedules", Icon: SchedulesIcon, href: "#schedules" },
  { id: "about",     label: "About",     Icon: AboutIcon,     href: "#footer" },
  { id: "help",      label: "Help",      Icon: HelpIcon,      href: "#footer" },
];

const featureStrip = [
  {
    Icon: BusStatIcon,
    title: "Line history",
    desc: "Review routes and trips grouped by line for your bus.",
  },
  {
    Icon: RouteFeatureIcon,
    title: "Track history",
    desc: "Review past runs and status.",
  },
  {
    Icon: CalendarFeatureIcon,
    title: "Stay on schedule",
    desc: "Departure times and line details.",
  },
  {
    Icon: NotifyIcon,
    title: "Report incidents",
    desc: "Notify managers and read their replies.",
  },
];

export default function DriverLandingPage() {
  const [activeNav, setActiveNav] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <div className={styles.navLogoWrap}>
            <Image src="/bus-logo.png" alt="UNITRANS logo" width={36} height={36} />
          </div>
          <div>
            <span className={styles.navTitle}>UNITRANS</span>
            <span className={styles.navSub}>University Transport System</span>
          </div>
        </div>

        <ul className={styles.navLinks}>
          {navItems.map(({ id, label, Icon, href }) => (
            <li key={id}>
              <a
                href={href}
                className={`${styles.navLink} ${activeNav === id ? styles.navLinkActive : ""}`}
                onClick={() => { setActiveNav(id); setMobileMenuOpen(false); }}
              >
                <Icon size={14} color="currentColor" />
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.navRight}>
          <Link href="/driver/login" className={styles.navBtn}>
            <LoginIcon size={14} color="#fff" />
            Driver Login
          </Link>
          <button
            className={styles.hamburger}
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map(({ id, label, Icon, href }) => (
            <a
              key={id}
              href={href}
              className={`${styles.mobileNavLink} ${activeNav === id ? styles.mobileNavLinkActive : ""}`}
              onClick={() => { setActiveNav(id); setMobileMenuOpen(false); }}
            >
              <Icon size={16} color="currentColor" />
              {label}
            </a>
          ))}
          <Link href="/driver/login" className={styles.mobileNavBtn} onClick={() => setMobileMenuOpen(false)}>
            <LoginIcon size={14} color="#fff" /> Driver Login
          </Link>
        </div>
      )}

      {/* ── Hero ── */}
      <section className={styles.hero} id="home">
        {/* Left: text + CTAs */}
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            Your Journey.<br />
            <span className={styles.heroTitleBlue}>Our Priority.</span>
          </h1>
          <p className={styles.heroDesc}>
            UNITRANS makes your daily commute easy, reliable and safe. Access schedules, manage your subscription, and stay updated – all in one place.
          </p>
          <div className={styles.heroCtas}>
            {/*<Link href="/driver/login" className={styles.heroCtaPrimary}>
              <LoginIcon size={15} color="#fff" />
              Driver Login
            </Link>*/}
            <a href="#services" className={styles.heroCtaSecondary}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
              How It Works
            </a>
          </div>
        </div>

        {/* Right: bus photo + floating card */}
        <div className={styles.heroRight}>
          <div className={styles.heroImageWrap}>
            <Image
              src="/bus2.png"
              alt="University campus bus"
              fill
              className={styles.heroImage}
              priority
              sizes="55vw"
            />
          </div>

          {/* Floating Plan Your Ride card */}
          <div className={styles.planCard}>
            <div className={styles.planCardTitle}>Plan Your Ride</div>
            <div className={styles.planCardDesc}>Check schedules, routes and plan your journey easily.</div>
            <div className={styles.planInputWrap}>
              <span className={styles.planInputIcon}><MapPinSmall /></span>
              <input
                type="text"
                className={styles.planInput}
                placeholder="Enter destination or line"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/driver/login" className={styles.planSearchBtn}>
              <SearchIcon size={14} color="#fff" />
              Search Routes
              <ArrowRightIcon size={13} color="#fff" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Driver features ── */}
      <section className={styles.featureStripOuter} id="services">
        <div className={styles.featureStripCard}>
          <div className={styles.featureStrip}>
            {featureStrip.map((f) => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featureIconWrap}>
                  <f.Icon size={24} color="#1a56db" />
                </div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer} id="footer">
        <div className={styles.footerLeft}>
          <ShieldFooterIcon size={14} color="#1a56db" />
          <span className={styles.footerTagline}>Safe. Reliable. On Time.</span>
        </div>
        <div className={styles.footerCenter}>
          We are committed to providing a safe and efficient transport service for all students.
        </div>
        <div className={styles.footerRight}>
          <HeartIcon size={13} color="#1a56db" />
          <span>UNITRANS – Moving Together</span>
        </div>
      </footer>

    </div>
  );
}
