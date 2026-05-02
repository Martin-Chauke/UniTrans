import { client } from "@/api/client";
import type {
  Incident,
  IncidentRequest,
  PatchedIncidentRequest,
  PatchedIncidentResolveRequest,
  PaginatedList,
} from "@/api/types";

// ─── Incidents ────────────────────────────────────────────────────────────────

/**
 * GET /api/incidents/
 * List all incidents.
 */
export const getIncidents = (page?: number) =>
  client.get<PaginatedList<Incident>>("/api/incidents/", { params: { page } });

/**
 * POST /api/incidents/
 * Report a new incident (Manager only).
 */
export const createIncident = (data: IncidentRequest) =>
  client.post<Incident>("/api/incidents/", data);

/**
 * GET /api/incidents/{incident_id}/
 */
export const getIncident = (incidentId: number) =>
  client.get<Incident>(`/api/incidents/${incidentId}/`);

/**
 * PUT /api/incidents/{incident_id}/
 */
export const updateIncident = (incidentId: number, data: IncidentRequest) =>
  client.put<Incident>(`/api/incidents/${incidentId}/`, data);

/**
 * PATCH /api/incidents/{incident_id}/
 */
export const patchIncident = (
  incidentId: number,
  data: PatchedIncidentRequest
) => client.patch<Incident>(`/api/incidents/${incidentId}/`, data);

/**
 * DELETE /api/incidents/{incident_id}/
 */
export const deleteIncident = (incidentId: number) =>
  client.delete(`/api/incidents/${incidentId}/`);

/**
 * PATCH /api/incidents/{incident_id}/resolve/
 * Mark an incident as resolved.
 */
export const resolveIncident = (
  incidentId: number,
  data?: PatchedIncidentResolveRequest
) =>
  client.patch<Incident>(`/api/incidents/${incidentId}/resolve/`, data ?? {});

// ─── Manager — incidents ──────────────────────────────────────────────────────

/**
 * GET /api/manager/incidents/
 */
export const managerGetIncidents = (page?: number) =>
  client.get<PaginatedList<Incident>>("/api/manager/incidents/", {
    params: { page },
  });

/**
 * POST /api/manager/incidents/
 */
export const managerCreateIncident = (data: IncidentRequest) =>
  client.post<Incident>("/api/manager/incidents/", data);

/**
 * GET /api/manager/incidents/{incident_id}/
 */
export const managerGetIncident = (incidentId: number) =>
  client.get<Incident>(`/api/manager/incidents/${incidentId}/`);

/**
 * PUT /api/manager/incidents/{incident_id}/
 */
export const managerUpdateIncident = (
  incidentId: number,
  data: IncidentRequest
) => client.put<Incident>(`/api/manager/incidents/${incidentId}/`, data);

/**
 * PATCH /api/manager/incidents/{incident_id}/
 */
export const managerPatchIncident = (
  incidentId: number,
  data: PatchedIncidentRequest
) => client.patch<Incident>(`/api/manager/incidents/${incidentId}/`, data);

/**
 * DELETE /api/manager/incidents/{incident_id}/
 */
export const managerDeleteIncident = (incidentId: number) =>
  client.delete(`/api/manager/incidents/${incidentId}/`);

/**
 * PATCH /api/manager/incidents/{incident_id}/resolve/
 */
export const managerResolveIncident = (
  incidentId: number,
  data?: PatchedIncidentResolveRequest
) =>
  client.patch<Incident>(
    `/api/manager/incidents/${incidentId}/resolve/`,
    data ?? {}
  );

/**
 * PATCH /api/manager/incidents/{incident_id}/respond/
 */
export const managerRespondToIncident = (
  incidentId: number,
  data: { message: string }
) =>
  client.patch<Incident>(
    `/api/manager/incidents/${incidentId}/respond/`,
    data
  );
