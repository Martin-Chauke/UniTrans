"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getStudentDashboard } from "@/api/modules/student/student.api";
import { getActiveSubscription, getSubscriptionHistory, getLineTimetable, getLine, getMySeat } from "@/api/modules/student/student.api";
import type { StudentDashboard, Subscription, SubscriptionHistory, Timetable, Line } from "@/api/types";
import styles from "./dashboard.module.css";

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const BusIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="13" rx="3" /><path d="M1 10h22" />
    <circle cx="5.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" />
  </svg>
);
const ClockIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CreditCardIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
  </svg>
);
const AlertIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const ReportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);


interface TimetableEntry {
  time: string;
  bus: string;
  from: string;
  to: string;
  status: string;
}

export default function StudentDashboardPage() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [line, setLine] = useState<Line | null>(null);
  const [seat, setSeat] = useState<{ row_number: number | null; seat_number: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [dashRes, subRes, histRes] = await Promise.allSettled([
        getStudentDashboard(),
        getActiveSubscription(),
        getSubscriptionHistory(),
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboard(dashRes.value.data);
        const s = dashRes.value.data.current_seat;
        if (s) setSeat(s);
      }
      if (subRes.status === "fulfilled") {
        setSubscription(subRes.value.data);
        const lineId = subRes.value.data.line;
        if (lineId) {
          const [ttRes, lineRes] = await Promise.allSettled([
            getLineTimetable(lineId),
            getLine(lineId),
          ]);
          if (ttRes.status === "fulfilled") setTimetable(ttRes.value.data);
          if (lineRes.status === "fulfilled") setLine(lineRes.value.data);
        }
      }
      if (histRes.status === "fulfilled") {
        setHistory(histRes.value.data.results?.slice(0, 3) ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const lineName = subscription?.line_detail?.name ?? dashboard?.active_subscription?.line_name ?? "—";
  const unread = dashboard?.unread_notifications ?? 0;

  // Build timetable rows from schedule data
  const scheduleRows: TimetableEntry[] = timetable?.schedules?.map((s) => ({
    time: s.departure_time?.slice(0, 5) ?? "--:--",
    bus: "—",
    from: line?.stations?.[0]?.station?.name ?? "Campus",
    to: line?.stations?.[line.stations.length - 1]?.station?.name ?? "City Center",
    status: "On time",
  })) ?? [];

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* ── Row 1: Current Summary (full width) ── */}
      <div className={styles.gridTop}>
        <div className={`${styles.card} ${styles.summaryCard} ${styles.fullWidth}`}>
          <div className={styles.cardHeader}>
            <ClockIcon size={16} />
            <span>Current Summary</span>
          </div>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryIcon}><BusIcon /></div>
              <div className={styles.summaryLabel}>Current Line</div>
              <div className={styles.summaryValue}>{lineName?.split(" ")[0] ?? "—"}</div>
              <div className={styles.summaryMeta}>{lineName}</div>
              <Link href="/student/transport" className={styles.summaryLink}>View Details</Link>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryIcon}><ClockIcon size={32} /></div>
              <div className={styles.summaryLabel}>Next Bus</div>
              <div className={styles.summaryValue}>
                {scheduleRows[0]?.time ?? "--:--"}
              </div>
              <div className={styles.summaryMeta}>
                {scheduleRows[0] ? "Scheduled" : "No upcoming trips"}
              </div>
              <Link href="/student/schedule" className={styles.summaryLink}>View Schedule</Link>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryIcon}><CreditCardIcon size={32} /></div>
              <div className={styles.summaryLabel}>Subscription</div>
              <div className={`${styles.summaryValue} ${subscription?.is_active ? styles.activeGreen : styles.inactiveRed}`}>
                {subscription?.is_active ? "Active" : "Inactive"}
              </div>
              <div className={styles.summaryMeta}>
                {subscription?.end_date ? `Valid until ${new Date(subscription.end_date).toLocaleDateString("en-GB")}` : "—"}
              </div>
              <Link href="/student/subscription" className={styles.summaryLink}>Manage Subscription</Link>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryIcon}><AlertIcon size={32} /></div>
              <div className={styles.summaryLabel}>Alerts</div>
              <div className={`${styles.summaryValue} ${unread > 0 ? styles.alertRed : ""}`}>
                {unread > 0 ? `${unread} new` : "None"}
              </div>
              <div className={styles.summaryMeta}>&nbsp;</div>
              <Link href="/student/notifications" className={styles.summaryLink}>Tap to view</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Transport + Schedule + Station ── */}
      <div className={styles.gridMid}>
        {/* My Transport Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <BusIcon />
            <span>My Transport Details</span>
          </div>
          <div className={styles.detailList}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}><BusIcon /> Line</span>
              <span className={styles.detailValue}>{lineName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}><BusIcon /> Bus Number</span>
              <span className={styles.detailValue}>
                {seat?.seat_number != null ? `Seat ${seat.seat_number}, Row ${seat.row_number}` : "—"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}><MapPinIcon /> Pickup Station</span>
              <span className={styles.detailValue}>
                {line?.stations?.[0]?.station?.name ?? "—"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}><ClockIcon size={14} /> Start Date</span>
              <span className={styles.detailValue}>
                {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString("en-GB") : "—"}
              </span>
            </div>
          </div>
          <Link href="/student/transport" className={styles.cardFooterLink}>View Full Details</Link>
        </div>

        {/* View Schedule Today */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ClockIcon size={16} />
            <span>View Schedule (Today)</span>
            <Link href="/student/schedule" className={styles.viewAll}>View full timetable</Link>
          </div>
          {scheduleRows.length === 0 ? (
            <div className={styles.emptyNote}>No schedule data available.</div>
          ) : (
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>From → To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduleRows.slice(0, 6).map((row, i) => (
                  <tr key={i} className={i === 1 ? styles.nextTrip : ""}>
                    <td className={styles.scheduleTime}>{row.time}</td>
                    <td>{row.from} → {row.to}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        row.status === "Completed" ? styles.statusCompleted :
                        i === 1 ? styles.statusNext : styles.statusOnTime
                      }`}>
                        {i === 1 ? "Next" : row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className={styles.tableNote}>All times are estimated</p>
        </div>

        {/* My Station & Line */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MapPinIcon />
            <span>My Station & Line</span>
            <Link href="/student/station-line" className={styles.viewAll}>View route</Link>
          </div>
          <div className={styles.stationInfo}>
            <div className={styles.stationLabel}>My Station</div>
            <div className={styles.stationName}>{line?.stations?.[0]?.station?.name ?? "—"}</div>
          </div>
          <div className={styles.stationSub}>Stations on {lineName.split(" ")[0]}</div>
          <div className={styles.stationList}>
            {line?.stations?.slice(0, 6).map((ls, i) => (
              <div key={ls.line_station_id} className={`${styles.stationStop} ${i === 0 ? styles.currentStop : ""}`}>
                <div className={styles.stopDot} />
                <span>{ls.station.name}{i === 0 ? " (You)" : ""}</span>
              </div>
            ))}
          </div>
          <Link href="/student/station-line" className={styles.cardFooterLink}>View All Stations</Link>
        </div>
      </div>

      {/* ── Row 3: Request + My Requests + Assignment History ── */}
      <div className={styles.gridBottom}>
        {/* Request Line Change */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <RefreshIcon />
            <span>Request Line Change</span>
          </div>
          <p className={styles.cardDesc}>Want to change your line? Check available lines and request a change.</p>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Select New Line</label>
            <div className={styles.selectWrap}>
              <select className={styles.select}>
                <option>Loading available lines…</option>
              </select>
            </div>
          </div>
          <Link href="/student/request-change" className={styles.primaryBtn}>Request Change</Link>
        </div>

        {/* My Requests */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ReportIcon />
            <span>My Requests</span>
            <Link href="/student/requests" className={styles.viewAll}>View all</Link>
          </div>
          {history.length === 0 ? (
            <div className={styles.emptyNote}>No requests found.</div>
          ) : (
            <div className={styles.requestList}>
              {history.slice(0, 3).map((h) => (
                <div key={h.subscription_history_id} className={styles.requestItem}>
                  <div className={styles.requestInfo}>
                    <div className={styles.requestTitle}>Request to {h.new_line_name}</div>
                    <div className={styles.requestDate}>
                      {new Date(h.change_date).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <span className={styles.pendingBadge}>Processed</span>
                </div>
              ))}
            </div>
          )}
          <Link href="/student/requests" className={styles.cardFooterLink}>View All Requests</Link>
        </div>

        {/* Assignment History */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ClockIcon size={16} />
            <span>Assignment History</span>
            <Link href="/student/assignment-history" className={styles.viewAll}>View all</Link>
          </div>
          {history.length === 0 ? (
            <div className={styles.emptyNote}>No assignment history.</div>
          ) : (
            <div className={styles.assignList}>
              {history.map((h, i) => (
                <div key={h.subscription_history_id} className={styles.assignItem}>
                  <div className={`${styles.assignDot} ${i === 0 ? styles.assignDotActive : ""}`} />
                  <div className={styles.assignInfo}>
                    <div className={styles.assignLine}>{h.new_line_name}</div>
                    <div className={styles.assignDate}>{new Date(h.change_date).toLocaleDateString("en-GB")}</div>
                  </div>
                  {i === 0 && <span className={styles.currentTag}>Current</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Subscription History + Report/Support ── */}
      <div className={styles.gridLast}>
        {/* Subscription History */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <CreditCardIcon size={16} />
            <span>Subscription History</span>
            <Link href="/student/subscription-history" className={styles.viewAll}>View all</Link>
          </div>
          <table className={styles.histTable}>
            <thead>
              <tr>
                <th>Line</th>
                <th>Period</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={5} className={styles.emptyNote}>No history.</td></tr>
              ) : history.map((h) => (
                <tr key={h.subscription_history_id}>
                  <td>{h.new_line_name || h.old_line_name}</td>
                  <td>Change on {new Date(h.change_date).toLocaleDateString("en-GB")}</td>
                  <td><span className={styles.histBadge}>Processed</span></td>
                  <td>{new Date(h.change_date).toLocaleDateString("en-GB")}</td>
                  <td>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Report / Support */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ReportIcon />
            <span>Report / Support</span>
          </div>
          <p className={styles.cardDesc}>Need help or want to report an issue?</p>
          <div className={styles.reportGrid}>
            <Link href="/student/reports?type=delay" className={styles.reportBtn}>
              <ClockIcon size={18} /> Report Delay
            </Link>
            <Link href="/student/reports?type=incident" className={styles.reportBtn}>
              <AlertIcon size={18} /> Report Incident
            </Link>
            <Link href="/student/reports?type=inquiry" className={styles.reportBtn}>
              <CheckCircleIcon /> General Inquiry
            </Link>
            <Link href="/student/reports?type=other" className={styles.reportBtn}>
              <RefreshIcon /> Contact Support
            </Link>
          </div>
          <Link href="/student/reports" className={styles.cardFooterLink}>View My Reports</Link>
        </div>
      </div>

      <footer className={styles.footer}>
        © 2026 UNITRANS – University Transportation Service. All rights reserved.
      </footer>
    </div>
  );
}
