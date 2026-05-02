"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllDriverTrips, getDriverLines } from "@/api/modules/driver/driver.api";
import type { DriverLine, Trip } from "@/api/types";
import styles from "../subpage.module.css";

type LineGroup = {
  lineId: number;
  lineName: string;
  trips: Trip[];
};

function groupTripsByLine(trips: Trip[]): Map<number, LineGroup> {
  const map = new Map<number, LineGroup>();
  for (const t of trips) {
    const lineId = t.schedule_detail?.line ?? 0;
    const lineName =
      (t.line_name && t.line_name.trim()) ||
      (t.schedule_detail?.line_name && t.schedule_detail.line_name.trim()) ||
      (lineId ? `Line #${lineId}` : "Unknown line");
    if (!map.has(lineId)) {
      map.set(lineId, { lineId, lineName, trips: [] });
    }
    map.get(lineId)!.trips.push(t);
  }
  for (const g of map.values()) {
    g.trips.sort((a, b) => b.trip_id - a.trip_id);
  }
  return map;
}

export default function DriverLineHistoryPage() {
  const [lines, setLines] = useState<DriverLine[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [lnRes, allTrips] = await Promise.all([
        getDriverLines().catch(() => ({ data: [] as DriverLine[] })),
        fetchAllDriverTrips().catch(() => [] as Trip[]),
      ]);
      setLines(lnRes.data ?? []);
      setTrips(allTrips);
    } catch {
      setLines([]);
      setTrips([]);
      setError("Could not load line data for your bus.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tripsByLineId = useMemo(() => groupTripsByLine(trips), [trips]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Line history</h1>
        <p className={styles.pageSub}>
          Lines assigned to your bus (active or inactive assignment). Stops are listed in order; trip runs appear
          when available.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Assigned lines</div>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : lines.length === 0 ? (
          <p className={styles.emptyState}>
            No lines are linked to your bus yet. Your manager can add bus–line assignments or schedule trips for your
            vehicle.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {lines.map((ln) => {
              const tripGroup = tripsByLineId.get(ln.line_id);
              const lineTrips = tripGroup?.trips ?? [];
              const completed = lineTrips.filter((t) => t.status === "completed").length;
              const active = ln.is_assignment_active === true;
              return (
                <div
                  key={ln.line_id}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "var(--color-bg)",
                      borderBottom: "1px solid var(--color-border)",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "8px 16px",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{ln.name}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: active ? "var(--color-blue-light)" : "var(--color-border)",
                        color: active ? "var(--color-blue-text)" : "var(--color-muted)",
                      }}
                    >
                      {active ? "Assignment active" : "Assignment inactive"}
                    </span>
                    {lineTrips.length > 0 && (
                      <span className={styles.hintMuted} style={{ margin: 0 }}>
                        {lineTrips.length} trip{lineTrips.length !== 1 ? "s" : ""}
                        {completed > 0 ? ` · ${completed} completed` : ""}
                      </span>
                    )}
                  </div>
                  {ln.description?.trim() ? (
                    <div style={{ padding: "10px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                      {ln.description}
                    </div>
                  ) : null}
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--color-text)" }}>
                      Stations (order)
                    </div>
                    {(ln.stations?.length ?? 0) === 0 ? (
                      <p className={styles.hintMuted} style={{ margin: 0 }}>
                        No stations configured for this line.
                      </p>
                    ) : (
                      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--color-text)" }}>
                        {(ln.stations ?? [])
                          .slice()
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((ls) => (
                            <li key={ls.line_station_id} style={{ marginBottom: 6 }}>
                              <strong>{ls.station.name}</strong>
                              <span style={{ color: "var(--color-muted)", fontSize: 12 }}>
                                {" "}
                                — {ls.station.address}
                              </span>
                            </li>
                          ))}
                      </ol>
                    )}
                  </div>
                  {lineTrips.length > 0 && (
                    <div style={{ overflowX: "auto", borderTop: "1px solid var(--color-border)" }}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Trip</th>
                            <th>Status</th>
                            <th>Departure</th>
                            <th>Bus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineTrips.map((t) => (
                            <tr key={t.trip_id}>
                              <td>TRP{String(t.trip_id).padStart(3, "0")}</td>
                              <td>{(t.status ?? "—").replace("_", " ")}</td>
                              <td>
                                {t.actual_departure
                                  ? new Date(t.actual_departure).toLocaleString()
                                  : t.schedule_detail?.departure_time?.slice(0, 5) ?? "—"}
                              </td>
                              <td>{t.bus_detail?.registration_number ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
