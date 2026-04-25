"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { studentClient, setStudentTokens, clearStudentTokens, getStudentAccessToken } from "@/api/student-client";
import type { LoginRequest, RegisterRequest, TokenResponse, Student } from "@/api/types";

interface StudentUser {
  user_id: number;
  name: string;
  email: string;
  student_id?: number;
  registration_number?: string;
  first_name?: string;
  last_name?: string;
}

interface StudentAuthContextValue {
  user: StudentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextValue | null>(null);

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Roles that belong to managers — must not access the student portal */
const MANAGER_ROLES = ["TransportManager"];
/** Roles allowed in the student portal */
const ALLOWED_STUDENT_ROLES = ["Student", "Admin"];

async function fetchStudentProfile(): Promise<Partial<StudentUser>> {
  try {
    const res = await studentClient.get<{
      student_id: number;
      registration_number: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      user?: { user_id: number; name: string; email: string; role: string };
    }>("/api/students/me/");
    const d = res.data;
    return {
      student_id: d.student_id,
      registration_number: d.registration_number,
      first_name: d.first_name,
      last_name: d.last_name,
      email: d.email,
      name: d.user?.name ?? `${d.first_name} ${d.last_name}`,
      user_id: d.user?.user_id,
    };
  } catch {
    return {};
  }
}

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getStudentAccessToken();
      if (token) {
        const payload = parseJwt(token);
        if (payload) {
          const role = payload.role as string | undefined;
          if (role && !ALLOWED_STUDENT_ROLES.includes(role)) {
            clearStudentTokens();
            setIsLoading(false);
            return;
          }
          // Set basic info from JWT immediately so layout guard passes
          const base: StudentUser = {
            user_id: payload.user_id as number,
            name: (payload.name as string) ?? "",
            email: (payload.email as string) ?? "",
          };
          setUser(base);
          // Then enrich with full profile (student_id, registration_number, etc.)
          const profile = await fetchStudentProfile();
          setUser((prev) => prev ? { ...prev, ...profile } : prev);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await studentClient.post<TokenResponse>("/api/auth/login/", data);
    const { access, refresh, user: userData } = response.data;

    const payload = parseJwt(access);
    const role = payload?.role as string | undefined;

    // Block managers; allow Student and Admin (Admin can bypass both portals)
    if (role && !ALLOWED_STUDENT_ROLES.includes(role)) {
      throw new Error("Access denied: this portal is for students only.");
    }

    setStudentTokens(access, refresh);

    // Set from token response first
    const base: StudentUser = {
      user_id: userData.user_id,
      name: userData.name,
      email: userData.email,
    };
    setUser(base);

    // Enrich with full student profile
    const profile = await fetchStudentProfile();
    setUser((prev) => prev ? { ...prev, ...profile } : prev);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await studentClient.post<Student>("/api/auth/register/", data);
  }, []);

  const logout = useCallback(() => {
    clearStudentTokens();
    setUser(null);
  }, []);

  return (
    <StudentAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth(): StudentAuthContextValue {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error("useStudentAuth must be used within StudentAuthProvider");
  return ctx;
}
