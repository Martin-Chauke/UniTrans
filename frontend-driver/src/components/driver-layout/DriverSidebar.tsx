"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDriverAuth } from "@/context/DriverAuthContext";
import styles from "./DriverSidebar.module.css";

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="13" rx="3" />
    <path d="M1 10h22" />
    <circle cx="5.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const BellNavIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const navItems = [
  { href: "/driver/dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/driver/lines", label: "Line history", icon: <HistoryIcon /> },
  { href: "/driver/incidents", label: "Incidents", icon: <AlertIcon /> },
  { href: "/driver/notifications", label: "Notifications", icon: <BellNavIcon /> },
  { href: "/driver/profile", label: "Profile", icon: <UserIcon /> },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function DriverSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const { logout, user } = useDriverAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/driver/login");
  };

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${mobileOpen ? styles.mobileOpen : ""}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="5" width="22" height="13" rx="3" /><path d="M1 10h22" />
              <circle cx="5.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <div className={styles.logoText}>UNITRANS</div>
              <div className={styles.logoSub}>Driver Portal</div>
            </div>
          )}
        </div>
        <button type="button" className={styles.toggleBtn} onClick={onToggle} title="Toggle sidebar">
          <ChevronIcon collapsed={collapsed} />
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
              title={collapsed ? item.label : undefined}
              onClick={onMobileClose}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {!collapsed && user && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{(user.name || user.email || "D")[0].toUpperCase()}</div>
            <div className={styles.userMeta}>
              <div className={styles.userName}>{user.name || "Driver"}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>
        )}
        <button type="button" className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <LogoutIcon />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
