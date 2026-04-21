"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useManagerNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/useNotifications";
import styles from "./TopBar.module.css";

interface TopBarProps {
  alertCount?: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TopBar({ alertCount = 0 }: TopBarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications">("profile");
  const [searchValue, setSearchValue] = useState("");
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useManagerNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: markRead } = useMarkNotificationRead();

  const notifications = notifData?.results ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleOpenNotif = () => {
    setNotifOpen((v) => !v);
    setUserMenuOpen(false);
  };

  const handleOpenUser = () => {
    setUserMenuOpen((v) => !v);
    setNotifOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "M";

  return (
    <header className={styles.topbar}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <span className={styles.searchIcon}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search for lines, destinations, students..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>

      <div className={styles.actions}>
        {/* Notifications bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button className={styles.iconBtn} onClick={handleOpenNotif} aria-label="Notifications">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                {unreadCount > 0 && (
                  <button className={styles.markAllBtn} onClick={() => markAllRead()}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <p className={styles.notifEmpty}>No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.notification_id}
                      className={`${styles.notifItem} ${!n.is_read ? styles.notifItemUnread : ""}`}
                      onClick={() => {
                        if (!n.is_read) markRead(n.notification_id);
                      }}
                    >
                      <span className={`${styles.notifDot} ${n.is_read ? styles.notifDotRead : ""}`} />
                      <div style={{ flex: 1 }}>
                        <div className={styles.notifMessage}>{n.message}</div>
                        <span className={styles.notifTime}>{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className={styles.userMenu} ref={menuRef}>
          <button
            className={styles.iconBtn}
            onClick={handleOpenUser}
            aria-label="User menu"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownTabs}>
                <button
                  className={`${styles.dropdownTab} ${activeTab === "profile" ? styles.dropdownTabActive : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </button>
                <button
                  className={`${styles.dropdownTab} ${activeTab === "notifications" ? styles.dropdownTabActive : ""}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>

              {activeTab === "profile" && (
                <div className={styles.profileTab}>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileAvatar}>{initials}</div>
                    <div className={styles.profileDetails}>
                      <span className={styles.profileName}>{user?.name ?? "Manager"}</span>
                      <span className={styles.profileEmail}>{user?.email ?? ""}</span>
                      <span className={styles.profileRole}>{user?.role ?? "manager"}</span>
                    </div>
                  </div>
                  <button className={styles.profileSignout} onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className={styles.notifList} style={{ maxHeight: 320 }}>
                  {notifications.length === 0 ? (
                    <p className={styles.notifEmpty}>No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notification_id}
                        className={`${styles.notifItem} ${!n.is_read ? styles.notifItemUnread : ""}`}
                        onClick={() => {
                          if (!n.is_read) markRead(n.notification_id);
                        }}
                      >
                        <span className={`${styles.notifDot} ${n.is_read ? styles.notifDotRead : ""}`} />
                        <div style={{ flex: 1 }}>
                          <div className={styles.notifMessage}>{n.message}</div>
                          <span className={styles.notifTime}>{timeAgo(n.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
