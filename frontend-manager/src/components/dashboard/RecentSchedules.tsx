"use client";

import { useState } from "react";
import Link from "next/link";
import type { Schedule } from "@/api/types";
import { Badge, statusToBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useLineStations } from "@/hooks/useLines";
import styles from "./RecentSchedules.module.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface RecentSchedulesProps {
  schedules: Schedule[];
  onQuickSchedule?: () => void;
}

function StationsModal({ lineId, lineName, open, onClose }: { lineId: number | null; lineName: string; open: boolean; onClose: () => void }) {
  const { data, isLoading } = useLineStations(lineId);
  const stations = (data?.results ?? []).slice().sort((a, b) => a.order_index - b.order_index);

  return (
    <Modal open={open} onClose={onClose} title={`Stations — ${lineName}`} size="sm">
      {isLoading ? (
        <p className={styles.stationsEmpty}>Loading stations...</p>
      ) : stations.length === 0 ? (
        <p className={styles.stationsEmpty}>No stations found for this line.</p>
      ) : (
        <div className={styles.stationsList}>
          {stations.map((ls, idx) => (
            <div key={ls.line_station_id} className={styles.stationsItem}>
              <span className={styles.stationsIndex}>{idx + 1}</span>
              <div>
                <div className={styles.stationsName}>{ls.station.name}</div>
                {ls.station.address && (
                  <div className={styles.stationsAddress}>{ls.station.address}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export function RecentSchedules({ schedules, onQuickSchedule }: RecentSchedulesProps) {
  const [stationsSchedule, setStationsSchedule] = useState<Schedule | null>(null);
  const recent = schedules.slice(0, 5);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          Recent Schedules
        </h2>
        <Link href="/schedule" className={styles.viewAll}>
          View all
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>LINE</th>
            <th>DAY</th>
            <th>DEPARTURE</th>
            <th>ARRIVAL</th>
            <th>STATIONS</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((s) => (
            <tr
              key={s.schedule_id}
              className={styles.clickableRow}
              onClick={() => setStationsSchedule(s)}
              title="Click to view stations"
            >
              <td className={styles.lineName}>{s.line_name}</td>
              <td>{DAYS[s.day_of_week] ?? s.day_of_week_display}</td>
              <td>{s.departure_time.slice(0, 5)}</td>
              <td>{s.arrival_time.slice(0, 5)}</td>
              <td>
                <button className={styles.stationBtn} onClick={(e) => { e.stopPropagation(); setStationsSchedule(s); }}>
                  View stations
                </button>
              </td>
              <td><Badge variant="active">Active</Badge></td>
            </tr>
          ))}
          {recent.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.empty}>No schedules yet</td>
            </tr>
          )}
        </tbody>
      </table>

      <StationsModal
        open={!!stationsSchedule}
        onClose={() => setStationsSchedule(null)}
        lineId={stationsSchedule?.line ?? null}
        lineName={stationsSchedule?.line_name ?? ""}
      />
    </div>
  );
}
