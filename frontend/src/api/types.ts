// ─── Enums ────────────────────────────────────────────────────────────────────

export type BusStatus = "available" | "in_service" | "maintenance";

/** 0=Monday … 6=Sunday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type IncidentType =
  | "delay"
  | "breakdown"
  | "accident"
  | "capacity"
  | "other";

export type NotificationType =
  | "trip_started"
  | "trip_delay"
  | "seat_assigned"
  | "line_change"
  | "incident"
  | "assignment_conflict"
  | "capacity_warning"
  | "general";

export type UserRole = "Admin" | "TransportManager";

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedList<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  registration_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

export interface ManagerRegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefresh {
  access: string;
  refresh: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user: User;
}

// ─── User & Student ───────────────────────────────────────────────────────────

export interface User {
  user_id: number;
  name: string;
  email: string;
  role?: UserRole;
  is_active?: boolean;
  date_joined: string;
}

export interface UserRequest {
  name: string;
  email: string;
  role?: UserRole;
}

export interface Student {
  student_id: number;
  registration_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface StudentRequest {
  registration_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface StudentDetail extends Student {
  user: User;
}

export interface StudentDetailRequest {
  registration_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface PatchedStudentDetailRequest {
  registration_number?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface StudentSeatView {
  seat_assignment_id: number;
  seat_number: number;
  row_number: number;
  trip_id: number;
  trip_status: string;
  line_name: string;
  assigned_at?: string;
}

// ─── Station & Line ───────────────────────────────────────────────────────────

export interface Station {
  station_id: number;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface StationRequest {
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PatchedStationRequest {
  name?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LineStation {
  line_station_id: number;
  station: Station;
  order_index: number;
}

export interface LineStationRequest {
  station_id: number;
  order_index: number;
}

export interface Line {
  line_id: number;
  name: string;
  description?: string;
  stations: LineStation[];
}

export interface LineRequest {
  name: string;
  description?: string;
}

export interface LineWrite {
  line_id: number;
  name: string;
  description?: string;
}

export interface LineWriteRequest {
  name: string;
  description?: string;
}

export interface PatchedLineWriteRequest {
  name?: string;
  description?: string;
}

export interface TimetableSchedule {
  schedule_id: number;
  day_of_week: DayOfWeek;
  departure_time: string;
  arrival_time: string;
  direction?: string;
}

export interface Timetable {
  line: Line;
  schedules: TimetableSchedule[];
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface Schedule {
  schedule_id: number;
  line: number;
  line_name: string;
  day_of_week: DayOfWeek;
  day_of_week_display: string;
  departure_time: string;
  arrival_time: string;
  direction?: string;
}

export interface ScheduleRequest {
  line: number;
  day_of_week: DayOfWeek;
  departure_time: string;
  arrival_time: string;
  direction?: string;
}

export interface PatchedScheduleRequest {
  line?: number;
  day_of_week?: DayOfWeek;
  departure_time?: string;
  arrival_time?: string;
  direction?: string;
}

// ─── Bus & BusAssignment ──────────────────────────────────────────────────────

export interface Bus {
  bus_id: number;
  registration_number: string;
  model: string;
  capacity: number;
  status?: BusStatus;
}

export interface BusRequest {
  registration_number: string;
  model: string;
  capacity: number;
  status?: BusStatus;
}

export interface PatchedBusRequest {
  registration_number?: string;
  model?: string;
  capacity?: number;
  status?: BusStatus;
}

export interface BusAssignment {
  bus_assignment_id: number;
  bus: number;
  bus_detail: Bus;
  line: number;
  line_detail: Line;
  start_date: string;
  end_date?: string | null;
  notes?: string;
  is_active: boolean;
  capacity_warning: string | { warning: boolean; message?: string; student_count?: number; bus_capacity?: number };
}

export interface BusAssignmentRequest {
  bus: number;
  line: number;
  start_date: string;
  end_date?: string | null;
  notes?: string;
}

export interface PatchedBusAssignmentRequest {
  bus?: number;
  line?: number;
  start_date?: string;
  end_date?: string | null;
  notes?: string;
}

// ─── Trip, Row & SeatAssignment ───────────────────────────────────────────────

export interface Trip {
  trip_id: number;
  status?: TripStatus;
  actual_departure: string | null;
  actual_arrival: string | null;
  schedule: number;
  schedule_detail: Schedule;
  bus: number;
  bus_detail: Bus;
  line_name: string;
  delay_minutes: string;
  occupied_seats?: number;
}

export interface TripRequest {
  status?: TripStatus;
  schedule: number;
  bus: number;
}

export interface TripWrite {
  trip_id: number;
  schedule: number;
  bus: number;
  status?: TripStatus;
}

export interface TripWriteRequest {
  schedule: number;
  bus: number;
  status?: TripStatus;
}

export interface PatchedTripWriteRequest {
  schedule?: number;
  bus?: number;
  status?: TripStatus;
}

export interface Row {
  row_id: number;
  row_number: number;
  seat_count: number;
  bus: number;
  bus_registration: string;
}

export interface RowRequest {
  row_number: number;
  seat_count: number;
  bus: number;
}

export interface PatchedRowRequest {
  row_number?: number;
  seat_count?: number;
  bus?: number;
}

export interface SeatAssignment {
  seat_assignment_id: number;
  assigned_at: string;
  seat_number: number;
  student: number;
  student_detail: Student;
  trip: number;
  trip_detail: Trip;
  row: number;
  row_detail: Row;
}

export interface SeatAssignmentRequest {
  seat_number: number;
  student: number;
  trip: number;
  row: number;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface Subscription {
  subscription_id: number;
  student: number;
  student_name: string;
  line: number;
  line_detail: Line;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface SubscribeRequest {
  line_id: number;
}

export interface ChangeLineRequest {
  new_line_id: number;
  reason?: string;
}

export interface SubscriptionHistory {
  subscription_history_id: number;
  change_date: string;
  reason?: string;
  student: number;
  old_line?: number | null;
  old_line_name: string;
  new_line?: number | null;
  new_line_name: string;
}

// ─── Incident ─────────────────────────────────────────────────────────────────

export interface Incident {
  incident_id: number;
  name: string;
  incident_type?: IncidentType;
  incident_type_display: string;
  description: string;
  reported_at: string;
  resolved?: boolean;
  trip: number;
  trip_detail: Trip;
}

export interface IncidentRequest {
  name: string;
  incident_type?: IncidentType;
  description: string;
  resolved?: boolean;
  trip: number;
}

export interface PatchedIncidentRequest {
  name?: string;
  incident_type?: IncidentType;
  description?: string;
  resolved?: boolean;
  trip?: number;
}

export interface PatchedIncidentResolveRequest {
  resolved?: boolean;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  notification_id: number;
  notification_type?: NotificationType;
  notification_type_display: string;
  message: string;
  is_read?: boolean;
  created_at: string;
  student: number;
}

export interface PatchedNotificationRequest {
  notification_type?: NotificationType;
  message?: string;
  is_read?: boolean;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface CapacityPerLine {
  line_id: number;
  line_name: string;
  active_subscriptions: number;
  bus_capacity: number;
  occupancy_percent: number | null;
  status: "exceeded" | "near_full" | "normal";
}

export interface BusUsage {
  bus_id: number;
  registration_number: string;
  model: string;
  capacity: number;
  status: BusStatus;
  total_trips: number;
  completed_trips: number;
  assigned_line: string | null;
}

export interface TripOccupancy {
  trip_id: number;
  line: string;
  status: TripStatus;
  assigned_seats: number;
  bus_capacity: number;
  occupancy_percent: number | null;
}

export interface IncidentByType {
  incident_type: IncidentType;
  count: number;
}

export interface IncidentSummary {
  total: number;
  open: number;
  resolved: number;
  by_type: IncidentByType[];
}

export interface ReportTotals {
  total_students: number;
  total_lines: number;
  total_buses: number;
  active_subscriptions: number;
}

export interface ReportData {
  capacity_per_line: CapacityPerLine[];
  bus_usage: BusUsage[];
  trip_occupancy: TripOccupancy[];
  incident_summary: IncidentSummary;
  totals: ReportTotals;
}

// ─── Driver ───────────────────────────────────────────────────────────────────

export interface Driver {
  driver_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  license_number: string;
  assigned_bus?: number | null;
  assigned_bus_detail?: Bus | null;
  is_active?: boolean;
}

export interface DriverRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  license_number: string;
  assigned_bus?: number | null;
  is_active?: boolean;
}

export interface PatchedDriverRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  license_number?: string;
  assigned_bus?: number | null;
  is_active?: boolean;
}

// ─── Dashboards ───────────────────────────────────────────────────────────────

export interface ActiveSubscriptionSummary {
  line_id: number | null;
  line_name: string | null;
}

export interface CurrentSeatSummary {
  row_number: number | null;
  seat_number: number | null;
  trip_id: number | null;
}

export interface StudentDashboard {
  student: Student;
  active_subscription: ActiveSubscriptionSummary | null;
  current_seat: CurrentSeatSummary | null;
  unread_notifications: number;
  recent_activity: Notification[];
}

export interface ManagerStats {
  total_students: number;
  total_lines: number;
  active_trips: number;
  available_buses: number;
  open_incidents: number;
  total_drivers: number;
}

export interface ManagerDashboard {
  stats: ManagerStats;
  system_alerts: Incident[];
}
