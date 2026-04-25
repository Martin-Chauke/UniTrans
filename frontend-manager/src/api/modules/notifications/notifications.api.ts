import { client } from "@/api/client";
import type {
  Notification,
  PatchedNotificationRequest,
  PaginatedList,
} from "@/api/types";

export type NotificationFilter =
  | "all"
  | "unread"
  | "incidents"
  | "warnings"
  | "assignments";

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * GET /api/notifications/
 * List all notifications for the authenticated user.
 * Optionally filter by type: all | unread | incidents | warnings | assignments
 */
export const getNotifications = (page?: number, filter?: NotificationFilter) =>
  client.get<PaginatedList<Notification>>("/api/notifications/", {
    params: { page, filter },
  });

/**
 * GET /api/notifications/{id}/
 */
export const getNotification = (id: number) =>
  client.get<Notification>(`/api/notifications/${id}/`);

/**
 * PATCH /api/notifications/{id}/
 * Partially update a notification (e.g. mark is_read).
 */
export const patchNotification = (
  id: number,
  data: PatchedNotificationRequest
) => client.patch<Notification>(`/api/notifications/${id}/`, data);

/**
 * DELETE /api/notifications/{id}/
 */
export const deleteNotification = (id: number) =>
  client.delete(`/api/notifications/${id}/`);

/**
 * PATCH /api/notifications/{id}/read/
 * Mark a single notification as read.
 */
export const markNotificationRead = (id: number) =>
  client.patch<Notification>(`/api/notifications/${id}/read/`);

/**
 * PATCH /api/notifications/read-all/
 * Mark all notifications as read for the authenticated user.
 */
export const markAllNotificationsRead = () =>
  client.patch("/api/notifications/read-all/");

// ─── Manager — notifications ──────────────────────────────────────────────────

/**
 * GET /api/manager/notifications/
 * Optionally filter by type: all | unread | incidents | warnings | assignments
 */
export const managerGetNotifications = (
  page?: number,
  filter?: NotificationFilter
) =>
  client.get<PaginatedList<Notification>>("/api/manager/notifications/", {
    params: { page, filter },
  });

/**
 * GET /api/manager/notifications/{id}/
 */
export const managerGetNotification = (id: number) =>
  client.get<Notification>(`/api/manager/notifications/${id}/`);

/**
 * PATCH /api/manager/notifications/{id}/
 */
export const managerPatchNotification = (
  id: number,
  data: PatchedNotificationRequest
) =>
  client.patch<Notification>(`/api/manager/notifications/${id}/`, data);

/**
 * DELETE /api/manager/notifications/{id}/
 */
export const managerDeleteNotification = (id: number) =>
  client.delete(`/api/manager/notifications/${id}/`);

/**
 * PATCH /api/manager/notifications/{id}/read/
 */
export const managerMarkNotificationRead = (id: number) =>
  client.patch<Notification>(`/api/manager/notifications/${id}/read/`);

/**
 * PATCH /api/manager/notifications/read-all/
 */
export const managerMarkAllNotificationsRead = () =>
  client.patch("/api/manager/notifications/read-all/");
