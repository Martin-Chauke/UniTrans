import { client } from "@/api/client";
import type {
  Trip,
  TripWrite,
  TripWriteRequest,
  PatchedTripWriteRequest,
  Row,
  RowRequest,
  PatchedRowRequest,
  SeatAssignment,
  SeatAssignmentRequest,
  StudentSeatView,
  PaginatedList,
} from "@/api/types";

// ─── Trips ────────────────────────────────────────────────────────────────────

/**
 * GET /api/trips/
 * List all trips.
 */
export const getTrips = (page?: number) =>
  client.get<PaginatedList<Trip>>("/api/trips/", { params: { page } });

/**
 * POST /api/trips/
 * Create a trip (Manager only).
 */
export const createTrip = (data: TripWriteRequest) =>
  client.post<TripWrite>("/api/trips/", data);

/**
 * GET /api/trips/{trip_id}/
 */
export const getTrip = (tripId: number) =>
  client.get<Trip>(`/api/trips/${tripId}/`);

/**
 * PUT /api/trips/{trip_id}/
 */
export const updateTrip = (tripId: number, data: TripWriteRequest) =>
  client.put<TripWrite>(`/api/trips/${tripId}/`, data);

/**
 * PATCH /api/trips/{trip_id}/
 */
export const patchTrip = (tripId: number, data: PatchedTripWriteRequest) =>
  client.patch<TripWrite>(`/api/trips/${tripId}/`, data);

/**
 * DELETE /api/trips/{trip_id}/
 */
export const deleteTrip = (tripId: number) =>
  client.delete(`/api/trips/${tripId}/`);

/**
 * POST /api/trips/{trip_id}/start/
 * Mark a trip as started (Manager only).
 */
export const startTrip = (tripId: number) =>
  client.post<Trip>(`/api/trips/${tripId}/start/`);

/**
 * POST /api/trips/{trip_id}/end/
 * Mark a trip as ended (Manager only).
 */
export const endTrip = (tripId: number) =>
  client.post<Trip>(`/api/trips/${tripId}/end/`);

// ─── Manager — trips ──────────────────────────────────────────────────────────

/**
 * GET /api/manager/trips/
 */
export const managerGetTrips = (page?: number) =>
  client.get<PaginatedList<Trip>>("/api/manager/trips/", { params: { page } });

/**
 * POST /api/manager/trips/
 */
export const managerCreateTrip = (data: TripWriteRequest) =>
  client.post<TripWrite>("/api/manager/trips/", data);

/**
 * GET /api/manager/trips/{trip_id}/
 */
export const managerGetTrip = (tripId: number) =>
  client.get<Trip>(`/api/manager/trips/${tripId}/`);

/**
 * PUT /api/manager/trips/{trip_id}/
 */
export const managerUpdateTrip = (tripId: number, data: TripWriteRequest) =>
  client.put<TripWrite>(`/api/manager/trips/${tripId}/`, data);

/**
 * PATCH /api/manager/trips/{trip_id}/
 */
export const managerPatchTrip = (
  tripId: number,
  data: PatchedTripWriteRequest
) => client.patch<TripWrite>(`/api/manager/trips/${tripId}/`, data);

/**
 * DELETE /api/manager/trips/{trip_id}/
 */
export const managerDeleteTrip = (tripId: number) =>
  client.delete(`/api/manager/trips/${tripId}/`);

/**
 * POST /api/manager/trips/{trip_id}/start/
 */
export const managerStartTrip = (tripId: number) =>
  client.post<Trip>(`/api/manager/trips/${tripId}/start/`);

/**
 * POST /api/manager/trips/{trip_id}/end/
 */
export const managerEndTrip = (tripId: number) =>
  client.post<Trip>(`/api/manager/trips/${tripId}/end/`);

// ─── Rows ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/rows/
 * List all bus rows.
 */
export const getRows = (page?: number) =>
  client.get<PaginatedList<Row>>("/api/rows/", { params: { page } });

/**
 * POST /api/rows/
 * Create a row (Manager only).
 */
export const createRow = (data: RowRequest) =>
  client.post<Row>("/api/rows/", data);

/**
 * GET /api/rows/{row_id}/
 */
export const getRow = (rowId: number) =>
  client.get<Row>(`/api/rows/${rowId}/`);

/**
 * PUT /api/rows/{row_id}/
 */
export const updateRow = (rowId: number, data: RowRequest) =>
  client.put<Row>(`/api/rows/${rowId}/`, data);

/**
 * PATCH /api/rows/{row_id}/
 */
export const patchRow = (rowId: number, data: PatchedRowRequest) =>
  client.patch<Row>(`/api/rows/${rowId}/`, data);

/**
 * DELETE /api/rows/{row_id}/
 */
export const deleteRow = (rowId: number) =>
  client.delete(`/api/rows/${rowId}/`);

// ─── Seat Assignments ─────────────────────────────────────────────────────────

/**
 * GET /api/seat-assignments/
 * List all seat assignments.
 */
export const getSeatAssignments = (page?: number) =>
  client.get<PaginatedList<SeatAssignment>>("/api/seat-assignments/", {
    params: { page },
  });

/**
 * POST /api/seat-assignments/
 * Assign a seat to a student (Manager only).
 */
export const createSeatAssignment = (data: SeatAssignmentRequest) =>
  client.post<SeatAssignment>("/api/seat-assignments/", data);

/**
 * GET /api/seat-assignments/{id}/
 */
export const getSeatAssignment = (id: number) =>
  client.get<SeatAssignment>(`/api/seat-assignments/${id}/`);

/**
 * DELETE /api/seat-assignments/{id}/
 */
export const deleteSeatAssignment = (id: number) =>
  client.delete(`/api/seat-assignments/${id}/`);

// ─── Manager — seat assignments ───────────────────────────────────────────────

/**
 * GET /api/manager/seat-assignments/
 */
export const managerGetSeatAssignments = (page?: number) =>
  client.get<PaginatedList<SeatAssignment>>(
    "/api/manager/seat-assignments/",
    { params: { page } }
  );

/**
 * POST /api/manager/seat-assignments/
 */
export const managerCreateSeatAssignment = (data: SeatAssignmentRequest) =>
  client.post<SeatAssignment>("/api/manager/seat-assignments/", data);

/**
 * GET /api/manager/seat-assignments/{id}/
 */
export const managerGetSeatAssignment = (id: number) =>
  client.get<SeatAssignment>(`/api/manager/seat-assignments/${id}/`);

/**
 * DELETE /api/manager/seat-assignments/{id}/
 */
export const managerDeleteSeatAssignment = (id: number) =>
  client.delete(`/api/manager/seat-assignments/${id}/`);

// ─── Student seat view ────────────────────────────────────────────────────────

/**
 * GET /api/students/me/seat/
 * Retrieve the authenticated student's current seat assignment.
 */
export const getMySeats = () =>
  client.get<StudentSeatView>("/api/students/me/seat/");
