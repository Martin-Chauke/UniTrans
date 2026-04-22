"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { PendingAlerts } from "@/components/dashboard/PendingAlerts";
import { RecentSchedules } from "@/components/dashboard/RecentSchedules";
import { ReportIncidentModal } from "@/components/incidents/ReportIncidentModal";
import { QuickScheduleModal } from "@/components/schedule/QuickScheduleModal";
import { AddStudentModal } from "@/components/students/AddStudentModal";
import { AddDriverModal } from "@/components/drivers/AddDriverModal";
import { useManagerDashboard } from "@/hooks/useDashboard";
import { useSchedules } from "@/hooks/useSchedules";
import { useStudents } from "@/hooks/useStudents";
import styles from "./dashboard.module.css";

const StudentsIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BusIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M8 6v6M16 6v6M2 12h19.6M18 18h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    <circle cx="8" cy="18" r="2" />
    <circle cx="16" cy="18" r="2" />
  </svg>
);

const TripsIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l3 3" />
  </svg>
);

const DriversIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="18" y1="11" x2="23" y2="11" />
  </svg>
);

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useManagerDashboard();
  const { data: schedulesData } = useSchedules();
  const { data: studentsData } = useStudents();

  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [reportIncidentOpen, setReportIncidentOpen] = useState(false);
  const [quickScheduleOpen, setQuickScheduleOpen] = useState(false);

  const stats = dashboard?.stats;
  const alerts = dashboard?.system_alerts ?? [];
  const schedules = schedulesData?.results ?? [];
  const students = studentsData?.results ?? [];
  const activeStudents = students.filter((s) => s.user?.is_active !== false).length;
  const inactiveStudents = students.filter((s) => s.user?.is_active === false).length;
  const studentSubtitle = students.length > 0 ? `${activeStudents} active / ${inactiveStudents} inactive` : undefined;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          title="Total Students"
          value={isLoading ? "—" : stats?.total_students ?? 0}
          subtitle={studentSubtitle}
          icon={<StudentsIcon />}
          href="/students"
        />
        <StatCard
          title="Active Buses"
          value={isLoading ? "—" : stats?.available_buses ?? 0}
          subtitle={`${stats?.total_lines ?? 0} lines total`}
          icon={<BusIcon />}
          href="/buses"
        />
        <StatCard
          title="Total Trips"
          value={isLoading ? "—" : stats?.active_trips ?? 0}
          subtitle="Today"
          icon={<TripsIcon />}
          href="/lines-trips"
        />
        <StatCard
          title="Total Drivers"
          value={isLoading ? "—" : stats?.total_drivers ?? 0}
          subtitle="Assigned"
          icon={<DriversIcon />}
          href="/drivers"
        />
      </div>

      <div className={styles.midRow}>
        <PendingAlerts incidents={alerts} />
        <ActionCenter
          onAddStudent={() => setAddStudentOpen(true)}
          onAddDriver={() => setAddDriverOpen(true)}
          onReportIncident={() => setReportIncidentOpen(true)}
          onQuickSchedule={() => setQuickScheduleOpen(true)}
        />
      </div>

      <RecentSchedules schedules={schedules} onQuickSchedule={() => setQuickScheduleOpen(true)} />

      <AddStudentModal open={addStudentOpen} onClose={() => setAddStudentOpen(false)} />
      <AddDriverModal open={addDriverOpen} onClose={() => setAddDriverOpen(false)} />
      <ReportIncidentModal open={reportIncidentOpen} onClose={() => setReportIncidentOpen(false)} />
      <QuickScheduleModal open={quickScheduleOpen} onClose={() => setQuickScheduleOpen(false)} />
    </div>
  );
}
