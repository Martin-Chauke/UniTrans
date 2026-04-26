"use client";

import { useQuery } from "@tanstack/react-query";
import { managerGetReports } from "@/api/modules/reports/reports.api";
import type {
  ReportData,
  SubscriptionTrendPoint,
  LineChangeByMonth,
  StationDensityPoint,
  PeakBoardingHour,
  IncidentByType,
} from "@/api/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList,
} from "recharts";
import styles from "./statistics.module.css";

// ─── Colour palette ───────────────────────────────────────────────────────────
const BLUE   = "#1a56db";
const TEAL   = "#06b6d4";
const GREEN  = "#22c55e";
const AMBER  = "#f59e0b";
const RED    = "#ef4444";
const PURPLE = "#8b5cf6";
const SLATE  = "#64748b";

const PIE_COLORS = [BLUE, AMBER, RED, TEAL, GREEN, PURPLE, SLATE];

const FUNNEL_COLORS = [BLUE, TEAL, GREEN];

// ─── Tooltip styles ───────────────────────────────────────────────────────────
const TooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StatisticsPage() {
  const { data: reportData, isLoading, isError } = useQuery<ReportData>({
    queryKey: ["manager-reports-stats"],
    queryFn: async () => {
      const res = await managerGetReports();
      return res.data;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading statistics…</div>
      </div>
    );
  }

  if (isError || !reportData) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Failed to load statistics. Please try again.</div>
      </div>
    );
  }

  const totals = reportData.totals;
  const subTrend: SubscriptionTrendPoint[] = reportData.subscription_trend ?? [];
  const changesByMonth: LineChangeByMonth[]  = reportData.line_change_by_month ?? [];
  const stationDensity: StationDensityPoint[] = reportData.station_density ?? [];
  const peakHours: PeakBoardingHour[]         = reportData.peak_boarding_hours ?? [];
  const incidentByType: IncidentByType[]      = reportData.incident_summary?.by_type ?? [];
  const incidentTotal = reportData.incident_summary?.total ?? 0;

  // Funnel — show all 3 stages using real line-change funnel data
  const funnelStages = reportData.line_change_funnel ?? [];
  const funnelMax = funnelStages[0]?.value ?? 1;

  // Capacity per line for occupancy bars
  const capacityData = reportData.capacity_per_line ?? [];

  return (
    <div className={styles.page}>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>View Statistics</h1>
        <p className={styles.subtitle}>
          Strategic planning metrics — demand, logistics, service quality, and route optimisation
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Students</div>
          <div className={styles.kpiValue}>{totals.total_students}</div>
          <div className={styles.kpiSub}>Registered in system</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Active Subscriptions</div>
          <div className={styles.kpiValue}>{totals.active_subscriptions}</div>
          <div className={styles.kpiSub}>Across {totals.total_lines} lines</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Buses</div>
          <div className={styles.kpiValue}>{totals.total_buses}</div>
          <div className={styles.kpiSub}>Fleet size</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Open Incidents</div>
          <div className={styles.kpiValue} style={{ color: RED }}>
            {reportData.incident_summary?.open ?? 0}
          </div>
          <div className={styles.kpiSub}>{incidentTotal} total reported</div>
        </div>
      </div>

      {/* ── Row 1: Subscription Trend + Line-Change Funnel ── */}
      <div className={styles.grid2}>

        {/* 1. Subscription Trend — LineChart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Subscription Trend (Last 6 Months)</span>
          </div>
          <p className={styles.cardDesc}>
            Monthly new subscriptions — tracks semester-level demand to predict fuel and funding requirements.
          </p>
          {subTrend.length === 0 ? (
            <p className={styles.emptyNote}>No subscription data available yet.</p>
          ) : (
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={subTrend} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="subscriptions"
                    stroke={BLUE}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: BLUE }}
                    activeDot={{ r: 6 }}
                    name="New Subscriptions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 2. Line-Change Request Funnel — horizontal BarChart / custom funnel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Line-Change Request Funnel</span>
          </div>
          <p className={styles.cardDesc}>
            Volume of student line-change applications as they move from initial submission to final completion.
          </p>
          {funnelStages.length === 0 ? (
            <p className={styles.emptyNote}>No line-change data available yet.</p>
          ) : (
            <div className={styles.funnelList}>
              {funnelStages.map((stage, i) => {
                const pct = funnelMax > 0 ? Math.round((stage.value / funnelMax) * 100) : 0;
                const width = Math.max(pct, 12);
                return (
                  <div key={stage.stage} className={styles.funnelItem}>
                    <div className={styles.funnelLabel}>
                      <span>{stage.stage}</span>
                      <span className={styles.funnelCount}>{stage.value}</span>
                    </div>
                    <div className={styles.funnelTrack}>
                      <div
                        className={styles.funnelBar}
                        style={{
                          width: `${width}%`,
                          background: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                          opacity: 1 - i * 0.12,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {/* Monthly trend below funnel */}
              {changesByMonth.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 6 }}>Monthly change volume</div>
                  <ResponsiveContainer width="100%" height={90}>
                    <BarChart data={changesByMonth} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={TooltipStyle} />
                      <Bar dataKey="changes" fill={TEAL} name="Changes" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Station Density Bubble + Incident Pie ── */}
      <div className={styles.grid2}>

        {/* 3. Station Density — Bubble / ScatterChart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Student Density at Stops</span>
          </div>
          <p className={styles.cardDesc}>
            Active subscriptions per station — larger bubbles indicate higher foot traffic, highlighting priority stops.
          </p>
          {stationDensity.length === 0 ? (
            <p className={styles.emptyNote}>No station data available yet.</p>
          ) : (
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 8, right: 16, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    dataKey="station_id"
                    name="Station"
                    tick={false}
                    label={{ value: "Stations", position: "insideBottom", offset: -8, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="active_subscriptions"
                    name="Subscriptions"
                    tick={{ fontSize: 11 }}
                    label={{ value: "Students", angle: -90, position: "insideLeft", offset: 10, fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="bubble_size" range={[40, 600]} />
                  <Tooltip
                    contentStyle={TooltipStyle}
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload as StationDensityPoint;
                      return (
                        <div style={TooltipStyle}>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.station}</div>
                          <div>{d.active_subscriptions} active students</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    data={stationDensity}
                    fill={BLUE}
                    fillOpacity={0.72}
                  >
                    <LabelList
                      dataKey="station"
                      position="top"
                      style={{ fontSize: 9, fill: "#374151" }}
                      formatter={(label) => {
                        const v = label == null ? "" : String(label);
                        return v.length > 14 ? `${v.slice(0, 13)}…` : v;
                      }}
                    />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 4. Incident Categories — PieChart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Incident Categories</span>
          </div>
          <p className={styles.cardDesc}>
            Breakdown of incoming incident reports by type — delays, mechanical issues, and other categories
            to support proactive service quality management.
          </p>
          {incidentByType.length === 0 ? (
            <p className={styles.emptyNote}>No incident data available yet.</p>
          ) : (
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={incidentByType}
                    dataKey="count"
                    nameKey="incident_type"
                    cx="50%"
                    cy="48%"
                    outerRadius={95}
                    innerRadius={48}
                    paddingAngle={3}
                    label={(props) => {
                      const name = String((props as { name?: string }).name ?? "");
                      const pct = Number((props as { percent?: number }).percent ?? 0);
                      return `${name} ${(pct * 100).toFixed(0)}%`;
                    }}
                    labelLine={false}
                  >
                    {incidentByType.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TooltipStyle}
                    formatter={(value) => [Number(value ?? 0), "incidents"]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={9}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value) => String(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Peak Boarding Hours histogram (full width) ── */}
      <div className={styles.grid2}>

        {/* 5. Peak Boarding Hours — BarChart histogram */}
        <div className={`${styles.card} ${styles.fullWidth}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Peak Boarding Hours</span>
          </div>
          <p className={styles.cardDesc}>
            Seat assignments grouped by hour of day — pinpoints the busiest boarding windows
            to enable proactive shuttle deployment during peak periods.
          </p>
          {peakHours.every((h) => h.boardings === 0) ? (
            <p className={styles.emptyNote}>No boarding data recorded yet. Data will appear once trips with seat assignments are created.</p>
          ) : (
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={peakHours} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={1} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Bar dataKey="boardings" name="Boardings" radius={[4, 4, 0, 0]}>
                    {peakHours.map((entry, index) => {
                      const pct = Math.max(...peakHours.map((h) => h.boardings)) > 0
                        ? entry.boardings / Math.max(...peakHours.map((h) => h.boardings))
                        : 0;
                      return (
                        <Cell
                          key={index}
                          fill={pct > 0.7 ? RED : pct > 0.4 ? AMBER : BLUE}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Line occupancy bar chart ── */}
      <div className={styles.grid2}>
        <div className={`${styles.card} ${styles.fullWidth}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Line Capacity & Occupancy</span>
          </div>
          <p className={styles.cardDesc}>
            Active subscriptions vs. bus capacity per line — identifies over-subscribed routes that may need additional buses.
          </p>
          {capacityData.length === 0 ? (
            <p className={styles.emptyNote}>No line data available yet.</p>
          ) : (
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={capacityData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="line_name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={TooltipStyle}
                    formatter={(value, name) => [Number(value ?? 0), String(name ?? "")]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="bus_capacity" name="Bus Capacity" fill={SLATE} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active_subscriptions" name="Active Students" fill={BLUE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
