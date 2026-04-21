"use client";

import { useState, useMemo } from "react";
import { useSchedules, useDeleteSchedule } from "@/hooks/useSchedules";
import { useLineStations } from "@/hooks/useLines";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { CreateScheduleModal } from "@/components/schedule/CreateScheduleModal";
import type { Schedule } from "@/api/types";
import styles from "./schedule.module.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function StationsModal({ lineId, lineName, open, onClose }: { lineId: number | null; lineName: string; open: boolean; onClose: () => void }) {
  const { data, isLoading } = useLineStations(lineId);
  const stations = data?.results ?? [];

  return (
    <Modal open={open} onClose={onClose} title={`Stations — ${lineName}`} size="sm">
      {isLoading ? (
        <p className={styles.stationsModalEmpty}>Loading stations...</p>
      ) : stations.length === 0 ? (
        <p className={styles.stationsModalEmpty}>No stations found for this line.</p>
      ) : (
        <div className={styles.stationsModalList}>
          {stations
            .slice()
            .sort((a, b) => a.order_index - b.order_index)
            .map((ls, idx) => (
              <div key={ls.line_station_id} className={styles.stationsModalItem}>
                <span className={styles.stationsModalIndex}>{idx + 1}</span>
                <div>
                  <div className={styles.stationsModalName}>{ls.station.name}</div>
                  {ls.station.address && (
                    <div className={styles.stationsModalAddress}>{ls.station.address}</div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </Modal>
  );
}

export default function SchedulePage() {
  const { data, isLoading } = useSchedules();
  const { mutate: deleteSchedule } = useDeleteSchedule();

  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [stationsSchedule, setStationsSchedule] = useState<Schedule | null>(null);

  const schedules = data?.results ?? [];

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const id = `SCH${String(s.schedule_id).padStart(3, "0")}`;
      const matchSearch =
        id.toLowerCase().includes(search.toLowerCase()) ||
        s.line_name.toLowerCase().includes(search.toLowerCase());
      const matchLine = lineFilter === "all" || String(s.line) === lineFilter;
      return matchSearch && matchLine;
    });
  }, [schedules, search, lineFilter]);

  const handleEdit = (schedule: Schedule) => {
    setEditSchedule(schedule);
    setCreateOpen(true);
  };

  const handleCloseModal = () => {
    setCreateOpen(false);
    setEditSchedule(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Schedule</h1>
          <p className={styles.subtitle}>Manage trip schedules and timetables</p>
        </div>
        <button className={styles.addBtn} onClick={() => setCreateOpen(true)}>
          + Create Schedule
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filters}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by schedule ID or line..." />
          <select className={styles.select} value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}>
            <option value="all">All Lines</option>
            {schedules
              .filter((s, i, arr) => arr.findIndex((x) => x.line === s.line) === i)
              .map((s) => (
                <option key={s.line} value={String(s.line)}>{s.line_name}</option>
              ))}
          </select>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading schedules...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>LINE</th>
                <th>DAY</th>
                <th>DEPARTURE</th>
                <th>ARRIVAL</th>
                <th>STATIONS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const scheduleId = `SCH${String(s.schedule_id).padStart(3, "0")}`;
                const lineStationCount = schedules
                  .filter((x) => x.line === s.line)
                  .length;
                return (
                  <tr key={s.schedule_id}>
                    <td className={styles.scheduleId}>{scheduleId}</td>
                    <td>{s.line_name}</td>
                    <td>{DAYS[s.day_of_week] ?? s.day_of_week_display}</td>
                    <td>{s.departure_time.slice(0, 5)}</td>
                    <td>{s.arrival_time.slice(0, 5)}</td>
                    <td>
                      <button
                        className={styles.stationBtn}
                        onClick={() => setStationsSchedule(s)}
                      >
                        View stations
                      </button>
                    </td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => handleEdit(s)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.empty}>No schedules found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <CreateScheduleModal
        open={createOpen}
        onClose={handleCloseModal}
        editSchedule={editSchedule}
      />

      <StationsModal
        open={!!stationsSchedule}
        onClose={() => setStationsSchedule(null)}
        lineId={stationsSchedule?.line ?? null}
        lineName={stationsSchedule?.line_name ?? ""}
      />
    </div>
  );
}
