import { client } from "@/api/client";
import type {
  Student,
  StudentRequest,
  StudentDetail,
  StudentDetailRequest,
  PatchedStudentDetailRequest,
  PaginatedList,
  StudentDashboard,
  ManagerDashboard,
} from "@/api/types";

// ─── Student (self) ───────────────────────────────────────────────────────────

/**
 * GET /api/students/me/
 * Retrieve the authenticated student's own profile.
 */
export const getMe = () => client.get<Student>("/api/students/me/");

/**
 * PUT /api/students/me/
 * Update the authenticated student's own profile.
 */
export const updateMe = (data: StudentRequest) =>
  client.put<Student>("/api/students/me/", data);

/**
 * GET /api/students/me/dashboard/
 * Student dashboard summary data.
 */
export const getStudentDashboard = () =>
  client.get<StudentDashboard>("/api/students/me/dashboard/");

// ─── Manager — dashboard ──────────────────────────────────────────────────────

/**
 * GET /api/manager/dashboard/
 * Manager overview dashboard data.
 */
export const getManagerDashboard = () =>
  client.get<ManagerDashboard>("/api/manager/dashboard/");

// ─── Manager — students list ──────────────────────────────────────────────────

/**
 * GET /api/manager/students/
 * List all students (Manager only). Supports pagination via `page` param.
 */
export const getStudents = (page?: number) =>
  client.get<PaginatedList<StudentDetail>>("/api/manager/students/", {
    params: { page },
  });

/**
 * GET /api/manager/students/{student_id}/
 * Retrieve a specific student's details (Manager only).
 */
export const getStudent = (studentId: number) =>
  client.get<StudentDetail>(`/api/manager/students/${studentId}/`);

/**
 * PUT /api/manager/students/{student_id}/
 * Fully update a student record (Manager only).
 */
export const updateStudent = (
  studentId: number,
  data: StudentDetailRequest
) => client.put<StudentDetail>(`/api/manager/students/${studentId}/`, data);

/**
 * PATCH /api/manager/students/{student_id}/
 * Partially update a student record (Manager only).
 */
export const patchStudent = (
  studentId: number,
  data: PatchedStudentDetailRequest
) => client.patch<StudentDetail>(`/api/manager/students/${studentId}/`, data);

/**
 * DELETE /api/manager/students/{student_id}/
 * Delete a student record (Manager only).
 */
export const deleteStudent = (studentId: number) =>
  client.delete(`/api/manager/students/${studentId}/`);
