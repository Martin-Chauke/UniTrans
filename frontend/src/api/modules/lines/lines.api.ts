import { client } from "@/api/client";
import type {
  Line,
  LineWrite,
  LineWriteRequest,
  PatchedLineWriteRequest,
  Station,
  StationRequest,
  PatchedStationRequest,
  Timetable,
  PaginatedList,
} from "@/api/types";

// ─── Lines ────────────────────────────────────────────────────────────────────

/**
 * GET /api/lines/
 * List all bus lines.
 */
export const getLines = (page?: number) =>
  client.get<PaginatedList<Line>>("/api/lines/", { params: { page } });

/**
 * POST /api/lines/
 * Create a new line (Manager only).
 */
export const createLine = (data: LineWriteRequest) =>
  client.post<LineWrite>("/api/lines/", data);

/**
 * GET /api/lines/{id}/
 * Retrieve a single line.
 */
export const getLine = (id: number) =>
  client.get<Line>(`/api/lines/${id}/`);

/**
 * PUT /api/lines/{id}/
 * Fully update a line (Manager only).
 */
export const updateLine = (id: number, data: LineWriteRequest) =>
  client.put<LineWrite>(`/api/lines/${id}/`, data);

/**
 * PATCH /api/lines/{id}/
 * Partially update a line (Manager only).
 */
export const patchLine = (id: number, data: PatchedLineWriteRequest) =>
  client.patch<LineWrite>(`/api/lines/${id}/`, data);

/**
 * DELETE /api/lines/{id}/
 * Delete a line (Manager only).
 */
export const deleteLine = (id: number) =>
  client.delete(`/api/lines/${id}/`);

/**
 * GET /api/lines/{id}/timetable/
 * Retrieve the full timetable for a line.
 */
export const getLineTimetable = (id: number) =>
  client.get<Timetable>(`/api/lines/${id}/timetable/`);

// ─── Manager — lines ──────────────────────────────────────────────────────────

/**
 * GET /api/manager/lines/
 * List all lines (Manager only).
 */
export const managerGetLines = (page?: number) =>
  client.get<PaginatedList<Line>>("/api/manager/lines/", { params: { page } });

/**
 * POST /api/manager/lines/
 */
export const managerCreateLine = (data: LineWriteRequest) =>
  client.post<LineWrite>("/api/manager/lines/", data);

/**
 * GET /api/manager/lines/{id}/
 */
export const managerGetLine = (id: number) =>
  client.get<Line>(`/api/manager/lines/${id}/`);

/**
 * PUT /api/manager/lines/{id}/
 */
export const managerUpdateLine = (id: number, data: LineWriteRequest) =>
  client.put<LineWrite>(`/api/manager/lines/${id}/`, data);

/**
 * PATCH /api/manager/lines/{id}/
 */
export const managerPatchLine = (id: number, data: PatchedLineWriteRequest) =>
  client.patch<LineWrite>(`/api/manager/lines/${id}/`, data);

/**
 * DELETE /api/manager/lines/{id}/
 */
export const managerDeleteLine = (id: number) =>
  client.delete(`/api/manager/lines/${id}/`);

/**
 * GET /api/manager/lines/{id}/timetable/
 */
export const managerGetLineTimetable = (id: number) =>
  client.get<Timetable>(`/api/manager/lines/${id}/timetable/`);

// ─── Stations ─────────────────────────────────────────────────────────────────

/**
 * GET /api/stations/
 * List all stations.
 */
export const getStations = (page?: number) =>
  client.get<PaginatedList<Station>>("/api/stations/", { params: { page } });

/**
 * POST /api/stations/
 * Create a station (Manager only).
 */
export const createStation = (data: StationRequest) =>
  client.post<Station>("/api/stations/", data);

/**
 * GET /api/stations/{id}/
 */
export const getStation = (id: number) =>
  client.get<Station>(`/api/stations/${id}/`);

/**
 * PUT /api/stations/{id}/
 */
export const updateStation = (id: number, data: StationRequest) =>
  client.put<Station>(`/api/stations/${id}/`, data);

/**
 * PATCH /api/stations/{id}/
 */
export const patchStation = (id: number, data: PatchedStationRequest) =>
  client.patch<Station>(`/api/stations/${id}/`, data);

/**
 * DELETE /api/stations/{id}/
 */
export const deleteStation = (id: number) =>
  client.delete(`/api/stations/${id}/`);

// ─── Manager — stations ───────────────────────────────────────────────────────

/**
 * GET /api/manager/stations/
 */
export const managerGetStations = (page?: number) =>
  client.get<PaginatedList<Station>>("/api/manager/stations/", {
    params: { page },
  });

/**
 * POST /api/manager/stations/
 */
export const managerCreateStation = (data: StationRequest) =>
  client.post<Station>("/api/manager/stations/", data);

/**
 * GET /api/manager/stations/{id}/
 */
export const managerGetStation = (id: number) =>
  client.get<Station>(`/api/manager/stations/${id}/`);

/**
 * PUT /api/manager/stations/{id}/
 */
export const managerUpdateStation = (id: number, data: StationRequest) =>
  client.put<Station>(`/api/manager/stations/${id}/`, data);

/**
 * PATCH /api/manager/stations/{id}/
 */
export const managerPatchStation = (
  id: number,
  data: PatchedStationRequest
) => client.patch<Station>(`/api/manager/stations/${id}/`, data);

/**
 * DELETE /api/manager/stations/{id}/
 */
export const managerDeleteStation = (id: number) =>
  client.delete(`/api/manager/stations/${id}/`);
