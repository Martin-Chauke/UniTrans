import { client } from "@/api/client";
import type { ReportData } from "@/api/types";

/**
 * GET /api/reports/
 * Aggregated system reports (Manager only).
 */
export const getReports = () => client.get<ReportData>("/api/reports/");

/**
 * GET /api/manager/reports/
 * Aggregated system reports via manager prefix (Manager only).
 */
export const managerGetReports = () =>
  client.get<ReportData>("/api/manager/reports/");
