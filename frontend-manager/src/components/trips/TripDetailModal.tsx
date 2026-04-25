"use client";

import { useState, useEffect } from "react";
import type { Trip, Line } from "@/api/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, statusToBadge } from "@/components/ui/Badge";
import { CapacityBar } from "@/components/ui/CapacityBar";
import { ReportIncidentModal } from "@/components/incidents/ReportIncidentModal";
import { linesApi } from "@/api";
import styles from "./TripDetailModal.module.css";

interface TripDetailModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export function TripDetailModal({ open, onClose, trip }: TripDetailModalProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [lineDetail, setLineDetail] = useState<Line | null>(null);
  const [lineLoading, setLineLoading] = useState(false);

  useEffect(() => {
    if (!open || !trip) {
      setLineDetail(null);
      return;
    }
    const lineId = trip.schedule_detail?.line;
    if (!lineId) return;
    setLineLoading(true);
    linesApi.managerGetLine(lineId)
      .then((res) => setLineDetail(res.data))
      .catch(() => setLineDetail(null))
      .finally(() => setLineLoading(false));
  }, [open, trip]);

  if (!trip) return null;

  const tripLabel = `TRP${String(trip.trip_id).padStart(3, "0")}`;
  const busId = trip.bus_detail?.registration_number ?? `BUS${String(trip.bus).padStart(3, "0")}`;
  const lineName = trip.line_name;
  const scheduleRef = `SCH${String(trip.schedule).padStart(3, "0")}`;
  const occupied = trip.occupied_seats ?? 0;
  const capacity = trip.bus_detail?.capacity ?? 50;

  const scheduledDep = trip.schedule_detail
    ? `${trip.schedule_detail.departure_time}`
    : "—";
  const actualDep = trip.actual_departure
    ? new Date(trip.actual_departure).toLocaleString()
    : "—";

  const stations = lineDetail?.stations ?? [];

  return (
    <>
      <Modal open={open} onClose={onClose} title="Trip Details" size="md">
        <div className={styles.body}>
          <span className={styles.tripId}>{tripLabel}</span>

          <div className={styles.grid}>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Bus ID</span>
              <span className={styles.cellValue}>{busId}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Line</span>
              <span className={styles.cellValue}>{lineName}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Status</span>
              <Badge variant={statusToBadge(trip.status ?? "scheduled")}>
                {trip.status ?? "scheduled"}
              </Badge>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Schedule Reference</span>
              <span className={styles.cellValue}>{scheduleRef}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Scheduled Departure</span>
              <span className={styles.cellValue}>{scheduledDep}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Actual Departure</span>
              <span className={styles.cellValue}>{actualDep}</span>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Seat Occupancy</span>
            <CapacityBar current={occupied} max={capacity} />
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              Stations
              {lineDetail && (
                <span className={styles.stationCount}>
                  {" "}— {stations.length} stop{stations.length !== 1 ? "s" : ""}
                </span>
              )}
            </span>
            <div className={styles.stationList}>
              {lineLoading ? (
                <div className={styles.stationLoading}>Loading stations…</div>
              ) : stations.length > 0 ? (
                stations.map((ls, i) => (
                  <div key={ls.line_station_id} className={styles.stationItem}>
                    <span className={styles.stationNum}>{i + 1}</span>
                    <div className={styles.stationInfo}>
                      <span className={styles.stationName}>{ls.station.name}</span>
                      {ls.station.address && (
                        <span className={styles.stationAddress}>{ls.station.address}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.stationEmpty}>No stations linked to this line.</p>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <button
              className={styles.reportBtn}
              onClick={() => setReportOpen(true)}
            >
              Report Incident
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      <ReportIncidentModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        defaultTripId={trip.trip_id}
      />
    </>
  );
}
