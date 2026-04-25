import { client } from "@/api/client";
import type { ReportData } from "@/api/types";

export const getReports = () => client.get<ReportData>("/api/reports/");
export const managerGetReports = () => client.get<ReportData>("/api/manager/reports/");

// ─── Student Reports ──────────────────────────────────────────────────────────

export interface StudentReportItem {
  report_id: number;
  student: number;
  student_name: string;
  student_email: string;
  report_type: string;
  report_type_display: string;
  title: string;
  description: string;
  status: "open" | "reviewed" | "resolved";
  status_display: string;
  submitted_at: string;
  resolved_at: string | null;
}

interface PaginatedStudentReports {
  count: number;
  next: string | null;
  previous: string | null;
  results: StudentReportItem[];
}

export const getStudentReports = (statusFilter?: string) =>
  client.get<PaginatedStudentReports | StudentReportItem[]>(
    `/api/manager/student-reports/${statusFilter ? `?status=${statusFilter}` : ""}`
  );

export const resolveStudentReport = (reportId: number) =>
  client.patch<StudentReportItem>(`/api/manager/student-reports/${reportId}/resolve/`, {});
