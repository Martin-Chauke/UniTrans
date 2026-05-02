"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getDriverMe,
  getDriverTrips,
  getDriverLines,
  getDriverIncidents,
} from "@/api/modules/driver/driver.api";
import type { DriverMe } from "@/api/modules/driver/driver.api";
import type { DriverLine, Incident, Trip } from "@/api/types";
import styles from "./dashboard.module.css";

const BusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="13" rx="3" /><path d="M1 10h22" />
    <circle cx="5.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" />
  </svg>
);

export default function DriverDashboardPage() {
  const [me, setMe] = useState<DriverMe | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [lines, setLines] = useState<DriverLine[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t, ln, i] = await Promise.all([
        getDriverMe(),
        getDriverTrips(1),
        getDriverLines().catch(() => ({ data: [] as DriverLine[] })),
        getDriverIncidents(1),
      ]);
      setMe(m.data);
      setTrips(t.data.results ?? []);
      setLines(ln.data ?? []);
      setIncidents(i.data.results ?? []);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const bus = me?.assigned_bus_detail as { registration_number?: string; model?: string } | undefined;
  const focusTrip =
    trips.find((tr) => tr.status === "in_progress") ??
    trips.find((tr) => tr.status === "scheduled") ??
    trips[0];

  const openIncidents = incidents.filter((x) => !x.resolved).length;
  const activeLineCount = lines.filter((l) => l.is_assignment_active === true).length;

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Your assigned bus, lines, and incident activity</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={load}>
          Refresh
        </button>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><BusIcon /></div>
          <div className={styles.statLabel}>Assigned bus</div>
          <div className={styles.statValue}>
            {bus?.registration_number ?? (me?.assigned_bus ? `Bus #${me.assigned_bus}` : "—")}
          </div>
          {bus?.model && <div className={styles.statHint}>{bus.model}</div>}
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Lines on your bus</div>
          <div className={styles.statValue}>{lines.length}</div>
          <div className={styles.statHint}>
            {activeLineCount} active assignment{activeLineCount !== 1 ? "s" : ""} today
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Open incidents (mine)</div>
          <div className={styles.statValue}>{openIncidents}</div>
          <Link href="/driver/incidents" className={styles.statLink}>View incidents</Link>
        </div>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Your assigned lines &amp; stops</h2>
        {!me?.assigned_bus ? (
          <p className={styles.muted}>No bus is assigned to your profile yet. Contact your transport manager.</p>
        ) : lines.length === 0 ? (
          <p className={styles.muted}>
            No lines are linked to this bus yet. When your manager assigns lines or schedules trips, they will appear
            here with stations.
          </p>
        ) : (
          <div className={styles.lineList}>
            {lines.map((ln) => {
              const ordered = (ln.stations ?? []).slice().sort((a, b) => a.order_index - b.order_index);
              const active = ln.is_assignment_active === true;
              return (
                <div key={ln.line_id} className={styles.lineBlock}>
                  <div className={styles.lineBlockHead}>
                    <span className={styles.lineTitle}>{ln.name}</span>
                    <span className={active ? styles.badgeActive : styles.badgeInactive}>
                      {active ? "Assignment active" : "Assignment inactive"}
                    </span>
                  </div>
                  {ordered.length === 0 ? (
                    <p className={styles.muted} style={{ margin: 0 }}>
                      No stations on this line yet.
                    </p>
                  ) : (
                    <ol className={styles.stationOl}>
                      {ordered.map((ls) => (
                        <li key={ls.line_station_id} className={styles.stationLi}>
                          <strong>{ls.station.name}</strong>
                          <div className={styles.stationAddr}>{ls.station.address}</div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {me?.assigned_bus && focusTrip && (
          <div className={styles.tripSnippet}>
            <p className={styles.tripSnippetTitle}>Current / next trip</p>
            <div className={styles.tripCard}>
              <div className={styles.tripRow}>
                <span className={styles.lineName} style={{ fontSize: 16, marginTop: 0 }}>
                  {focusTrip.line_name ?? "—"}
                </span>
                <span className={styles.badge}>{focusTrip.status?.replace("_", " ")}</span>
              </div>
              <div className={styles.meta}>
                <span>Trip TRP{String(focusTrip.trip_id).padStart(3, "0")}</span>
                {focusTrip.schedule_detail?.departure_time?.slice(0, 5) && (
                  <span> · Departs ~{focusTrip.schedule_detail.departure_time.slice(0, 5)}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {me?.assigned_bus && (
          <div className={styles.actions} style={{ marginTop: 16 }}>
            <Link href="/driver/incidents" className={styles.primaryBtn}>Report incident</Link>
            <Link href="/driver/lines" className={styles.secondaryBtn}>Line history</Link>
          </div>
        )}
      </div>
    </div>
  );
}
