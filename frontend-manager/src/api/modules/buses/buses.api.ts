import { client } from "@/api/client";
import type {
  Bus,
  BusRequest,
  PatchedBusRequest,
  BusAssignment,
  BusAssignmentRequest,
  PatchedBusAssignmentRequest,
  PaginatedList,
} from "@/api/types";

// ─── Buses ────────────────────────────────────────────────────────────────────

/**
 * GET /api/buses/
 * List all buses.
 */
export const getBuses = (page?: number) =>
  client.get<PaginatedList<Bus>>("/api/buses/", { params: { page } });

/**
 * POST /api/buses/
 * Create a bus (Manager only).
 */
export const createBus = (data: BusRequest) =>
  client.post<Bus>("/api/buses/", data);

/**
 * GET /api/buses/{bus_id}/
 */
export const getBus = (busId: number) =>
  client.get<Bus>(`/api/buses/${busId}/`);

/**
 * PUT /api/buses/{bus_id}/
 */
export const updateBus = (busId: number, data: BusRequest) =>
  client.put<Bus>(`/api/buses/${busId}/`, data);

/**
 * PATCH /api/buses/{bus_id}/
 */
export const patchBus = (busId: number, data: PatchedBusRequest) =>
  client.patch<Bus>(`/api/buses/${busId}/`, data);

/**
 * DELETE /api/buses/{bus_id}/
 */
export const deleteBus = (busId: number) =>
  client.delete(`/api/buses/${busId}/`);

// ─── Manager — buses ──────────────────────────────────────────────────────────

/**
 * GET /api/manager/buses/
 */
export const managerGetBuses = (page?: number) =>
  client.get<PaginatedList<Bus>>("/api/manager/buses/", { params: { page } });

/**
 * POST /api/manager/buses/
 */
export const managerCreateBus = (data: BusRequest) =>
  client.post<Bus>("/api/manager/buses/", data);

/**
 * GET /api/manager/buses/{bus_id}/
 */
export const managerGetBus = (busId: number) =>
  client.get<Bus>(`/api/manager/buses/${busId}/`);

/**
 * PUT /api/manager/buses/{bus_id}/
 */
export const managerUpdateBus = (busId: number, data: BusRequest) =>
  client.put<Bus>(`/api/manager/buses/${busId}/`, data);

/**
 * PATCH /api/manager/buses/{bus_id}/
 */
export const managerPatchBus = (busId: number, data: PatchedBusRequest) =>
  client.patch<Bus>(`/api/manager/buses/${busId}/`, data);

/**
 * DELETE /api/manager/buses/{bus_id}/
 */
export const managerDeleteBus = (busId: number) =>
  client.delete(`/api/manager/buses/${busId}/`);

// ─── Bus Assignments ──────────────────────────────────────────────────────────

/**
 * GET /api/bus-assignments/
 * List all bus assignments — includes capacity warnings.
 */
export const getBusAssignments = (page?: number) =>
  client.get<PaginatedList<BusAssignment>>("/api/bus-assignments/", {
    params: { page },
  });

/**
 * POST /api/bus-assignments/
 * Create a bus assignment (Manager only).
 */
export const createBusAssignment = (data: BusAssignmentRequest) =>
  client.post<BusAssignment>("/api/bus-assignments/", data);

/**
 * GET /api/bus-assignments/{bus_assignment_id}/
 */
export const getBusAssignment = (busAssignmentId: number) =>
  client.get<BusAssignment>(`/api/bus-assignments/${busAssignmentId}/`);

/**
 * PUT /api/bus-assignments/{bus_assignment_id}/
 */
export const updateBusAssignment = (
  busAssignmentId: number,
  data: BusAssignmentRequest
) =>
  client.put<BusAssignment>(
    `/api/bus-assignments/${busAssignmentId}/`,
    data
  );

/**
 * PATCH /api/bus-assignments/{bus_assignment_id}/
 */
export const patchBusAssignment = (
  busAssignmentId: number,
  data: PatchedBusAssignmentRequest
) =>
  client.patch<BusAssignment>(
    `/api/bus-assignments/${busAssignmentId}/`,
    data
  );

/**
 * DELETE /api/bus-assignments/{bus_assignment_id}/
 */
export const deleteBusAssignment = (busAssignmentId: number) =>
  client.delete(`/api/bus-assignments/${busAssignmentId}/`);

// ─── Manager — bus assignments ────────────────────────────────────────────────

/**
 * GET /api/manager/bus-assignments/
 */
export const managerGetBusAssignments = (page?: number) =>
  client.get<PaginatedList<BusAssignment>>("/api/manager/bus-assignments/", {
    params: { page },
  });

/**
 * POST /api/manager/bus-assignments/
 */
export const managerCreateBusAssignment = (data: BusAssignmentRequest) =>
  client.post<BusAssignment>("/api/manager/bus-assignments/", data);

/**
 * GET /api/manager/bus-assignments/{bus_assignment_id}/
 */
export const managerGetBusAssignment = (busAssignmentId: number) =>
  client.get<BusAssignment>(
    `/api/manager/bus-assignments/${busAssignmentId}/`
  );

/**
 * PUT /api/manager/bus-assignments/{bus_assignment_id}/
 */
export const managerUpdateBusAssignment = (
  busAssignmentId: number,
  data: BusAssignmentRequest
) =>
  client.put<BusAssignment>(
    `/api/manager/bus-assignments/${busAssignmentId}/`,
    data
  );

/**
 * PATCH /api/manager/bus-assignments/{bus_assignment_id}/
 */
export const managerPatchBusAssignment = (
  busAssignmentId: number,
  data: PatchedBusAssignmentRequest
) =>
  client.patch<BusAssignment>(
    `/api/manager/bus-assignments/${busAssignmentId}/`,
    data
  );

/**
 * DELETE /api/manager/bus-assignments/{bus_assignment_id}/
 */
export const managerDeleteBusAssignment = (busAssignmentId: number) =>
  client.delete(`/api/manager/bus-assignments/${busAssignmentId}/`);
