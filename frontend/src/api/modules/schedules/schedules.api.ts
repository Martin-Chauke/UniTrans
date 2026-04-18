import { client } from "@/api/client";
import type {
  Schedule,
  ScheduleRequest,
  PatchedScheduleRequest,
  PaginatedList,
} from "@/api/types";

// ─── Schedules ────────────────────────────────────────────────────────────────

/**
 * GET /api/schedules/
 * List all schedules.
 */
export const getSchedules = (page?: number) =>
  client.get<PaginatedList<Schedule>>("/api/schedules/", { params: { page } });

/**
 * POST /api/schedules/
 * Create a schedule (Manager only).
 */
export const createSchedule = (data: ScheduleRequest) =>
  client.post<Schedule>("/api/schedules/", data);

/**
 * GET /api/schedules/{id}/
 */
export const getSchedule = (id: number) =>
  client.get<Schedule>(`/api/schedules/${id}/`);

/**
 * PUT /api/schedules/{id}/
 */
export const updateSchedule = (id: number, data: ScheduleRequest) =>
  client.put<Schedule>(`/api/schedules/${id}/`, data);

/**
 * PATCH /api/schedules/{id}/
 */
export const patchSchedule = (id: number, data: PatchedScheduleRequest) =>
  client.patch<Schedule>(`/api/schedules/${id}/`, data);

/**
 * DELETE /api/schedules/{id}/
 */
export const deleteSchedule = (id: number) =>
  client.delete(`/api/schedules/${id}/`);

// ─── Manager — schedules ──────────────────────────────────────────────────────

/**
 * GET /api/manager/schedules/
 */
export const managerGetSchedules = (page?: number) =>
  client.get<PaginatedList<Schedule>>("/api/manager/schedules/", {
    params: { page },
  });

/**
 * POST /api/manager/schedules/
 */
export const managerCreateSchedule = (data: ScheduleRequest) =>
  client.post<Schedule>("/api/manager/schedules/", data);

/**
 * GET /api/manager/schedules/{id}/
 */
export const managerGetSchedule = (id: number) =>
  client.get<Schedule>(`/api/manager/schedules/${id}/`);

/**
 * PUT /api/manager/schedules/{id}/
 */
export const managerUpdateSchedule = (id: number, data: ScheduleRequest) =>
  client.put<Schedule>(`/api/manager/schedules/${id}/`, data);

/**
 * PATCH /api/manager/schedules/{id}/
 */
export const managerPatchSchedule = (
  id: number,
  data: PatchedScheduleRequest
) => client.patch<Schedule>(`/api/manager/schedules/${id}/`, data);

/**
 * DELETE /api/manager/schedules/{id}/
 */
export const managerDeleteSchedule = (id: number) =>
  client.delete(`/api/manager/schedules/${id}/`);
