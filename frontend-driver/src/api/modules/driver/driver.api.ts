import { driverClient } from "@/api/driver-client";
import type { DriverLine, Incident, Notification, PaginatedList, Trip } from "@/api/types";

export interface DriverMe {
  driver_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  license_number: string;
  assigned_bus: number | null;
  assigned_bus_detail: unknown;
  is_active: boolean;
  unread_notifications?: number;
  user?: { user_id: number; name: string; email: string; role: string };
}

export async function getDriverMe() {
  return driverClient.get<DriverMe>("/api/drivers/me/");
}

export async function patchDriverMe(data: Partial<Pick<DriverMe, "first_name" | "last_name" | "phone">>) {
  return driverClient.patch<DriverMe>("/api/drivers/me/", data);
}

export async function getDriverTrips(page = 1) {
  return driverClient.get<PaginatedList<Trip>>("/api/drivers/me/trips/", {
    params: { page },
  });
}

/** Fetches every page of trips (used to build line history grouped by route). */
export async function fetchAllDriverTrips(): Promise<Trip[]> {
  const all: Trip[] = [];
  let page = 1;
  for (;;) {
    const res = await getDriverTrips(page);
    const batch = res.data.results ?? [];
    all.push(...batch);
    if (!res.data.next || batch.length === 0) break;
    page += 1;
    if (page > 100) break;
  }
  return all;
}

export async function getDriverLines() {
  return driverClient.get<DriverLine[]>("/api/drivers/me/lines/");
}

export async function getDriverIncidents(page = 1) {
  return driverClient.get<PaginatedList<Incident>>("/api/drivers/me/incidents/", {
    params: { page },
  });
}

export async function postDriverIncident(body: {
  line: number;
  name: string;
  incident_type: string;
  description: string;
}) {
  return driverClient.post<Incident>("/api/drivers/me/incidents/", body);
}

export async function deleteDriverIncident(incidentId: number) {
  return driverClient.delete(`/api/drivers/me/incidents/${incidentId}/`);
}

export async function getDriverNotifications() {
  return driverClient.get<PaginatedList<Notification>>("/api/notifications/");
}

export async function markDriverNotificationRead(notificationId: number) {
  return driverClient.patch<Notification>(`/api/notifications/${notificationId}/read/`, {});
}

export async function markAllDriverNotificationsRead() {
  return driverClient.patch("/api/notifications/read-all/", {});
}
