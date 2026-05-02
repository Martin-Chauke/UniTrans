"use client";

import { useCallback, useEffect, useState } from "react";
import { getDriverTrips } from "@/api/modules/driver/driver.api";
import type { Trip } from "@/api/types";
import styles from "../subpage.module.css";

export default function DriverTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getDriverTrips(p);
      setTrips(res.data.results ?? []);
      setTotal(res.data.count ?? 0);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Trip history</h1>
        <p className={styles.pageSub}>Trips scheduled for your assigned bus</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Trips</div>
        {loading ? (
          <div className={styles.loading}><div className={styles.spinner} /></div>
        ) : trips.length === 0 ? (
          <p className={styles.emptyState}>No trips found. Ensure a bus is assigned to your profile.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Trip</th>
                <th>Line</th>
                <th>Status</th>
                <th>Departure</th>
                <th>Bus</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.trip_id}>
                  <td>TRP{String(t.trip_id).padStart(3, "0")}</td>
                  <td>{t.line_name ?? "—"}</td>
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
        )}
        {total > pageSize && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
            <button
              type="button"
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", cursor: page <= 1 ? "not-allowed" : "pointer" }}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", cursor: page >= totalPages ? "not-allowed" : "pointer" }}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
