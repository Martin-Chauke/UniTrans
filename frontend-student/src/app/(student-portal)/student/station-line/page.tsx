"use client";

import { useEffect, useState } from "react";
import { getActiveSubscription, getLine } from "@/api/modules/student/student.api";
import type { Subscription, Line } from "@/api/types";
import styles from "../subpage.module.css";

export default function StationLinePage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [line, setLine] = useState<Line | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const subRes = await getActiveSubscription().catch(() => null);
        if (subRes?.data?.line) {
          setSubscription(subRes.data);
          const lineRes = await getLine(subRes.data.line).catch(() => null);
          if (lineRes) setLine(lineRes.data);
        }
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  const lineName = subscription?.line_detail?.name ?? line?.name ?? "—";
  const myStation = line?.stations?.[0];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}> Station & Line</h1>
        <p className={styles.pageSub}>Your assigned line route and station information</p>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>My Station</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Station Name</div>
              <div className={styles.detailValue}>{myStation?.station?.name ?? "Not assigned"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Address</div>
              <div className={styles.detailValue}>{myStation?.station?.address ?? "—"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Stop Order</div>
              <div className={styles.detailValue}>Stop #{(myStation?.order_index ?? 0) + 1}</div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Line Information</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Line Name</div>
              <div className={styles.detailValue}>{lineName}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Description</div>
              <div className={styles.detailValue}>{line?.description ?? "—"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Total Stations</div>
              <div className={styles.detailValue}>{line?.stations?.length ?? 0} stops</div>
            </div>
          </div>
        </div>
      </div>

      {line && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Full Route — {lineName}</div>
          <div className={styles.stationTimeline}>
            {line.stations.map((ls, i) => (
              <div key={ls.line_station_id} className={styles.timelineStop}>
                {i < line.stations.length - 1 && <div className={styles.tsLine} />}
                <div className={`${styles.tsDot} ${i === 0 ? styles.tsDotActive : ""}`} />
                <div className={styles.tsLabel}>
                  <div className={styles.tsName}>
                    {ls.station.name}
                    {i === 0 && (
                      <span style={{ marginLeft: 8, fontSize: 11, padding: "1px 8px", borderRadius: 20, background: "var(--color-blue-light)", color: "var(--color-blue-text)", fontWeight: 600 }}>
                        Your Stop
                      </span>
                    )}
                    {i === line.stations.length - 1 && (
                      <span style={{ marginLeft: 8, fontSize: 11, padding: "1px 8px", borderRadius: 20, background: "var(--color-green-light)", color: "var(--color-green-text)", fontWeight: 600 }}>
                        Final Stop
                      </span>
                    )}
                  </div>
                  {ls.station.address && <div className={styles.tsAddr}>{ls.station.address}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
