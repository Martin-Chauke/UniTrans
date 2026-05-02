"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getDriverMe, getDriverTrips, getDriverIncidents } from "@/api/modules/driver/driver.api";
import type { DriverMe } from "@/api/modules/driver/driver.api";
import type { Incident, Trip } from "@/api/types";
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
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t, i] = await Promise.all([
        getDriverMe(),
        getDriverTrips(1),
        getDriverIncidents(1),
      ]);
      setMe(m.data);
      setTrips(t.data.results ?? []);
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
          <p className={styles.subtitle}>Your assigned bus, trips, and incident activity</p>
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
          <div className={styles.statLabel}>Recent trips loaded</div>
          <div className={styles.statValue}>{trips.length}</div>
          <div className={styles.statHint}>From your last page of history</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Open incidents (mine)</div>
          <div className={styles.statValue}>{openIncidents}</div>
          <Link href="/driver/incidents" className={styles.statLink}>View incidents</Link>
        </div>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Current / next trip</h2>
        {!me?.assigned_bus ? (
          <p className={styles.muted}>No bus is assigned to your profile yet. Contact your transport manager.</p>
        ) : !focusTrip ? (
          <p className={styles.muted}>No trips found for your bus yet.</p>
        ) : (
          <div className={styles.tripCard}>
            <div className={styles.tripRow}>
              <span className={styles.tripRef}>TRP{String(focusTrip.trip_id).padStart(3, "0")}</span>
              <span className={styles.badge}>{focusTrip.status?.replace("_", " ")}</span>
            </div>
            <div className={styles.lineName}>{focusTrip.line_name ?? "—"}</div>
            <div className={styles.meta}>
              {focusTrip.schedule_detail?.departure_time?.slice(0, 5) && (
                <span>Departs ~{focusTrip.schedule_detail.departure_time.slice(0, 5)}</span>
              )}
            </div>
            <div className={styles.actions}>
              <Link href="/driver/incidents" className={styles.primaryBtn}>Report incident</Link>
              <Link href="/driver/trips" className={styles.secondaryBtn}>All trips</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
