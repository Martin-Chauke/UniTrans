import { client } from "@/api/client";
import type { Driver, DriverRequest, PaginatedList, PatchedDriverRequest } from "@/api/types";

/**
 * GET /api/manager/drivers/
 * List all drivers (Manager only).
 */
export const managerGetDrivers = (page?: number) =>
  client.get<PaginatedList<Driver>>("/api/manager/drivers/", { params: { page } });

/**
 * POST /api/manager/drivers/
 * Create a new driver (Manager only).
 */
export const managerCreateDriver = (data: DriverRequest) =>
  client.post<Driver>("/api/manager/drivers/", data);

/**
 * GET /api/manager/drivers/{id}/
 */
export const managerGetDriver = (id: number) =>
  client.get<Driver>(`/api/manager/drivers/${id}/`);

/**
 * PUT /api/manager/drivers/{id}/
 */
export const managerUpdateDriver = (id: number, data: DriverRequest) =>
  client.put<Driver>(`/api/manager/drivers/${id}/`, data);

/**
 * PATCH /api/manager/drivers/{id}/
 */
export const managerPatchDriver = (id: number, data: PatchedDriverRequest) =>
  client.patch<Driver>(`/api/manager/drivers/${id}/`, data);

/**
 * DELETE /api/manager/drivers/{id}/
 */
export const managerDeleteDriver = (id: number) =>
  client.delete(`/api/manager/drivers/${id}/`);
