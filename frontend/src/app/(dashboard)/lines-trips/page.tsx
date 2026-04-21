"use client";

import { useState, useMemo } from "react";
import { useLines, useDeleteLine } from "@/hooks/useLines";
import { useTrips } from "@/hooks/useTrips";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge, statusToBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TripDetailModal } from "@/components/trips/TripDetailModal";
import { AddLineModal } from "@/components/lines/AddLineModal";
import { EditLineModal } from "@/components/lines/EditLineModal";
import type { Trip, Line } from "@/api/types";
import styles from "./lines-trips.module.css";

type Tab = "lines" | "trips";

export default function LinesTripsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("lines");

  const { data: linesData, isLoading: linesLoading } = useLines();
  const lines = linesData?.results ?? [];
  const { mutate: deleteLine } = useDeleteLine();

  const { data: tripsData, isLoading: tripsLoading } = useTrips();
  const trips = tripsData?.results ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [addLineOpen, setAddLineOpen] = useState(false);
  const [editLine, setEditLine] = useState<Line | null>(null);
  const [stationsLine, setStationsLine] = useState<Line | null>(null);

  const filteredLines = useMemo(() => {
    if (!search.trim()) return lines;
    const q = search.toLowerCase();
    return lines.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q)
    );
  }, [lines, search]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const tripId = `TRP${String(t.trip_id).padStart(3, "0")}`;
      const matchSearch =
        !search.trim() ||
        tripId.toLowerCase().includes(search.toLowerCase()) ||
        t.line_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [trips, search, statusFilter]);

  const handleDeleteLine = (line: Line) => {
    if (confirm(`Delete line "${line.name}"? This cannot be undone.`)) {
      deleteLine(line.line_id);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Lines / Trips</h1>
          <p className={styles.subtitle}>Manage lines and monitor trip execution</p>
        </div>
        <button className={styles.addBtn} onClick={() => setAddLineOpen(true)}>
          + Add Line
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "lines" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("lines")}
        >
          Lines
          {lines.length > 0 && (
            <span className={styles.tabCount}>{lines.length}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === "trips" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("trips")}
        >
          Trips
          {trips.length > 0 && (
            <span className={styles.tabCount}>{trips.length}</span>
          )}
        </button>
      </div>

      {activeTab === "lines" && (
        <div className={styles.tableCard}>
          <div className={styles.filters}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search by line name..." />
          </div>

          {linesLoading ? (
            <div className={styles.loading}>Loading lines...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>DESCRIPTION</th>
                  <th>STATIONS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLines.map((line) => {
                  const lineId = `LN${String(line.line_id).padStart(3, "0")}`;
                  const stationCount = line.stations?.length ?? 0;
                  return (
                    <tr key={line.line_id}>
                      <td className={styles.tripId}>{lineId}</td>
                      <td style={{ fontWeight: 600 }}>{line.name}</td>
                      <td style={{ color: "var(--color-text-secondary)" }}>
                        {line.description || "—"}
                      </td>
                      <td>
                        {stationCount > 0 ? (
                          <button
                            className={styles.stationsBtn}
                            onClick={() => setStationsLine(line)}
                          >
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {stationCount} station{stationCount !== 1 ? "s" : ""}
                          </button>
                        ) : (
                          <span style={{ color: "var(--color-muted)", fontSize: 13 }}>No stations</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => setEditLine(line)}
                          >
                            Edit
                          </button>
                          <span className={styles.actionDivider}>|</span>
                          <button
                            className={styles.actionBtnDanger}
                            onClick={() => handleDeleteLine(line)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredLines.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.empty}>
                      {lines.length === 0
                        ? 'No lines yet. Click "+ Add Line" to create one.'
                        : "No lines match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "trips" && (
        <div className={styles.tableCard}>
          <div className={styles.filters}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search by trip ID or line..." />
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {tripsLoading ? (
            <div className={styles.loading}>Loading trips...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>STATUS</th>
                  <th>LINE</th>
                  <th>ACTUAL DEPARTURE</th>
                  <th>STATIONS</th>
                  <th>SCHEDULE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => {
                  const tripLabel = `TRP${String(trip.trip_id).padStart(3, "0")}`;
                  const scheduleRef = `SCH${String(trip.schedule).padStart(3, "0")}`;
                  return (
                    <tr key={trip.trip_id}>
                      <td className={styles.tripId}>{tripLabel}</td>
                      <td>
                        <Badge variant={statusToBadge(trip.status ?? "scheduled")}>
                          {trip.status ?? "scheduled"}
                        </Badge>
                      </td>
                      <td style={{ fontWeight: 500 }}>{trip.line_name}</td>
                      <td>
                        {trip.actual_departure
                          ? new Date(trip.actual_departure).toLocaleString()
                          : "—"}
                      </td>
                      <td>
                        <span className={styles.stationsLink}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {trip.schedule_detail?.line_name
                            ? "view"
                            : "stations"}
                        </span>
                      </td>
                      <td>{scheduleRef}</td>
                      <td>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setSelectedTrip(trip)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredTrips.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.empty}>No trips found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      <TripDetailModal
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
      />

      <AddLineModal open={addLineOpen} onClose={() => setAddLineOpen(false)} />
      <EditLineModal open={!!editLine} onClose={() => setEditLine(null)} line={editLine} />

      {/* Stations detail modal */}
      <Modal
        open={!!stationsLine}
        onClose={() => setStationsLine(null)}
        title={stationsLine ? `${stationsLine.name} — Stations` : "Stations"}
        size="sm"
      >
        {stationsLine && (
          <div className={styles.stationsModal}>
            {(stationsLine.stations ?? []).length === 0 ? (
              <p className={styles.stationsEmpty}>No stations linked to this line.</p>
            ) : (
              <div className={styles.stationsList}>
                {stationsLine.stations.map((ls, i) => (
                  <div key={ls.line_station_id} className={styles.stationItem}>
                    <span className={styles.stationNum}>{i + 1}</span>
                    <div className={styles.stationInfo}>
                      <span className={styles.stationName}>{ls.station.name}</span>
                      {ls.station.address && (
                        <span className={styles.stationAddress}>{ls.station.address}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
