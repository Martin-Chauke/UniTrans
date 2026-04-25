"use client";

import { useEffect, useState, useCallback } from "react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/api/modules/student/student.api";
import type { Notification } from "@/api/types";
import styles from "../subpage.module.css";

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_LABELS: Record<string, string> = {
  trip_started: "Trip Started",
  trip_delay: "Delay Alert",
  seat_assigned: "Seat Assigned",
  line_change: "Line Change",
  incident: "Incident",
  assignment_conflict: "Conflict",
  capacity_warning: "Capacity Warning",
  general: "General",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await getNotifications();
      setNotifications(r.data.results ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number) => {
    await markNotificationRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className={styles.pageTitle}>Notifications</h1>
            <p className={styles.pageSub}>{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAll} className={styles.btnSecondary} style={{ height: 36, fontSize: 12 }}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>All Notifications</div>
        {notifications.length === 0 ? (
          <div className={styles.emptyState}>No notifications yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n) => (
              <div
                key={n.notification_id}
                className={`${styles.notifItem} ${!n.is_read ? styles.unread : ""}`}
                style={{ cursor: !n.is_read ? "pointer" : "default" }}
                onClick={() => !n.is_read && markRead(n.notification_id)}
              >
                {!n.is_read && <div className={styles.notifDot} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className={styles.badgeBlue} style={{ fontSize: 10 }}>
                      {TYPE_LABELS[n.notification_type ?? "general"] ?? n.notification_type_display}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{timeSince(n.created_at)}</span>
                  </div>
                  <div className={styles.notifMsg}>{n.message}</div>
                </div>
                {!n.is_read && (
                  <button
                    className={styles.btnSecondary}
                    style={{ height: 28, padding: "0 12px", fontSize: 11, flexShrink: 0 }}
                    onClick={(e) => { e.stopPropagation(); markRead(n.notification_id); }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
