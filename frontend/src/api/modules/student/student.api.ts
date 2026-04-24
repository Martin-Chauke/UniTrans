import { studentClient } from "@/api/student-client";
import type {
  Student,
  StudentRequest,
  StudentDashboard,
  StudentSeatView,
  Subscription,
  SubscribeRequest,
  ChangeLineRequest,
  SubscriptionHistory,
  Notification,
  PatchedNotificationRequest,
  Line,
  Timetable,
  PaginatedList,
} from "@/api/types";

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getMyProfile = () =>
  studentClient.get<Student>("/api/students/me/");

export const updateMyProfile = (data: StudentRequest) =>
  studentClient.put<Student>("/api/students/me/", data);

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getStudentDashboard = () =>
  studentClient.get<StudentDashboard>("/api/students/me/dashboard/");

// ─── Seat ─────────────────────────────────────────────────────────────────────

export const getMySeat = () =>
  studentClient.get<StudentSeatView>("/api/students/me/seat/");

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const getActiveSubscription = () =>
  studentClient.get<Subscription>("/api/subscriptions/active/");

export const subscribe = (data: SubscribeRequest) =>
  studentClient.post<Subscription>("/api/subscriptions/", data);

export const changeLine = (data: ChangeLineRequest) =>
  studentClient.put<Subscription>("/api/subscriptions/change-line/", data);

export const getSubscriptionHistory = () =>
  studentClient.get<PaginatedList<SubscriptionHistory>>(
    "/api/subscriptions/history/"
  );

// ─── Lines ────────────────────────────────────────────────────────────────────

export const getLines = () =>
  studentClient.get<PaginatedList<Line>>("/api/lines/");

export const getLine = (lineId: number) =>
  studentClient.get<Line>(`/api/lines/${lineId}/`);

export const getLineTimetable = (lineId: number) =>
  studentClient.get<Timetable>(`/api/lines/${lineId}/timetable/`);

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = () =>
  studentClient.get<PaginatedList<Notification>>("/api/notifications/");

export const markNotificationRead = (notificationId: number) =>
  studentClient.patch<Notification>(
    `/api/notifications/${notificationId}/read/`,
    {}
  );

export const markAllNotificationsRead = () =>
  studentClient.patch("/api/notifications/read-all/", {});

// ─── Reports / Support ────────────────────────────────────────────────────────

export interface StudentReport {
  title: string;
  report_type: "delay" | "incident" | "inquiry" | "other";
  description: string;
}

export const submitReport = (data: StudentReport) =>
  studentClient.post("/api/incidents/", data);
