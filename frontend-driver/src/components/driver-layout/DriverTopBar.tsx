"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDriverAuth } from "@/context/DriverAuthContext";
import { getDriverMe } from "@/api/modules/driver/driver.api";
import styles from "./DriverTopBar.module.css";

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

interface Props {
  onMenuOpen: () => void;
}

export function DriverTopBar({ onMenuOpen }: Props) {
  const { user, logout } = useDriverAuth();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
    getDriverMe()
      .then((r) => setUnreadCount(r.data.unread_notifications ?? 0))
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "";
    localStorage.setItem("unitrans_theme", next ? "dark" : "light");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Driver";

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button type="button" className={styles.menuBtn} onClick={onMenuOpen} aria-label="Open menu">
          <MenuIcon />
        </button>
        <div className={styles.welcome}>
          <span className={styles.welcomeText}>Welcome back,</span>
          <span className={styles.welcomeName}>{displayName}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        <Link href="/driver/notifications" className={styles.notifBtn} aria-label="Notifications">
          <BellIcon />
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </Link>

        <div className={styles.userMenu}>
          <button type="button" className={styles.userBtn} onClick={() => setMenuOpen((v) => !v)}>
            <div className={styles.avatar}>
              {(user?.name || user?.email || "D")[0].toUpperCase()}
            </div>
            <span className={styles.userName}>{displayName}</span>
            <ChevronDown />
          </button>
          {menuOpen && (
            <div className={styles.dropdown}>
              <Link href="/driver/profile" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <div className={styles.dropDivider} />
              <button
                type="button"
                className={styles.dropItemDanger}
                onClick={() => {
                  logout();
                  router.push("/driver/login");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
