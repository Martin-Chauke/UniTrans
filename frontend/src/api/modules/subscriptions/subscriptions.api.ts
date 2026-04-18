import { client } from "@/api/client";
import type {
  Subscription,
  SubscribeRequest,
  ChangeLineRequest,
  SubscriptionHistory,
  PaginatedList,
} from "@/api/types";

// ─── Student — subscriptions ──────────────────────────────────────────────────

/**
 * POST /api/subscriptions/
 * Subscribe the authenticated student to a line.
 */
export const subscribe = (data: SubscribeRequest) =>
  client.post<Subscription>("/api/subscriptions/", data);

/**
 * GET /api/subscriptions/active/
 * Retrieve the student's current active subscription.
 */
export const getActiveSubscription = () =>
  client.get<Subscription>("/api/subscriptions/active/");

/**
 * PUT /api/subscriptions/change-line/
 * Change the student's subscribed line.
 */
export const changeLine = (data: ChangeLineRequest) =>
  client.put<Subscription>("/api/subscriptions/change-line/", data);

/**
 * GET /api/subscriptions/history/
 * Retrieve the student's subscription change history.
 */
export const getSubscriptionHistory = (page?: number) =>
  client.get<PaginatedList<SubscriptionHistory>>(
    "/api/subscriptions/history/",
    { params: { page } }
  );

// ─── Manager — subscriptions ──────────────────────────────────────────────────

/**
 * GET /api/manager/subscriptions/
 * List all subscriptions (Manager only).
 */
export const managerGetSubscriptions = (page?: number) =>
  client.get<PaginatedList<Subscription>>("/api/manager/subscriptions/", {
    params: { page },
  });

/**
 * GET /api/manager/subscriptions/{id}/
 */
export const managerGetSubscription = (id: number) =>
  client.get<Subscription>(`/api/manager/subscriptions/${id}/`);
