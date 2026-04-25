"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyProfile, getMySeat, getActiveSubscription, getLine } from "@/api/modules/student/student.api";
import type { Student, Subscription, Line } from "@/api/types";
import styles from "../subpage.module.css";

export default function TransportPage() {
  const [profile, setProfile] = useState<Student | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [line, setLine] = useState<Line | null>(null);
  const [seat, setSeat] = useState<{ row_number: number | null; seat_number: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profRes, subRes, seatRes] = await Promise.allSettled([
          getMyProfile(),
          getActiveSubscription(),
          getMySeat(),
        ]);
        if (profRes.status === "fulfilled") setProfile(profRes.value.data);
        if (subRes.status === "fulfilled") {
          const sub = subRes.value.data;
          setSubscription(sub);
          if (sub.line) {
            const lineRes = await getLine(sub.line).catch(() => null);
            if (lineRes) setLine(lineRes.data);
          }
        }
        if (seatRes.status === "fulfilled") setSeat(seatRes.value.data);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  const lineName = subscription?.line_detail?.name ?? "—";
  const firstStation = line?.stations?.[0]?.station?.name ?? "—";

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Transport Details</h1>
        <p className={styles.pageSub}>Your current bus assignment and transport information</p>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Current Assignment</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Line</div>
              <div className={styles.detailValue}>{lineName}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Seat Number</div>
              <div className={styles.detailValue}>
                {seat?.seat_number != null ? `Row ${seat.row_number}, Seat ${seat.seat_number}` : "Not assigned"}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Pickup Station</div>
              <div className={styles.detailValue}>{firstStation}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Subscription Status</div>
              <div className={styles.detailValue}>
                <span className={subscription?.is_active ? styles.badgeGreen : styles.badgeRed}>
                  {subscription?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Start Date</div>
              <div className={styles.detailValue}>
                {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString("en-GB") : "—"}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>End Date</div>
              <div className={styles.detailValue}>
                {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString("en-GB") : "Ongoing"}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Student Information</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Full Name</div>
              <div className={styles.detailValue}>{profile ? `${profile.first_name} ${profile.last_name}` : "—"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Registration Number</div>
              <div className={styles.detailValue}>{profile?.registration_number ?? "—"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Email</div>
              <div className={styles.detailValue}>{profile?.email ?? "—"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Phone</div>
              <div className={styles.detailValue}>{profile?.phone ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {line && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Route Stations — {lineName}</div>
          <div className={styles.stationTimeline}>
            {line.stations.map((ls, i) => (
              <div key={ls.line_station_id} className={styles.timelineStop}>
                <div className={`${styles.tsDot} ${i === 0 ? styles.tsDotActive : ""}`} />
                <div className={styles.tsLabel}>
                  <div className={styles.tsName}>{ls.station.name}</div>
                  {ls.station.address && <div className={styles.tsAddr}>{ls.station.address}</div>}
                </div>
                {i < line.stations.length - 1 && <div className={styles.tsLine} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Link href="/student/request-change" className={styles.btnPrimary}>Request Line Change</Link>
        <Link href="/student/reports" className={styles.btnSecondary}>Report an Issue</Link>
      </div>
    </div>
  );
}
