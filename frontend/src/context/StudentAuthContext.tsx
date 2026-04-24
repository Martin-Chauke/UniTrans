"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { studentClient, setStudentTokens, clearStudentTokens, getStudentAccessToken } from "@/api/student-client";
import type { LoginRequest, RegisterRequest, TokenResponse, Student, User } from "@/api/types";

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

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStudentAccessToken();
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        setUser({
          user_id: payload.user_id as number,
          name: (payload.name as string) ?? "",
          email: (payload.email as string) ?? "",
        });
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await studentClient.post<TokenResponse>("/api/auth/login/", data);
    const { access, refresh, user: userData } = response.data;
    setStudentTokens(access, refresh);
    setUser({
      user_id: userData.user_id,
      name: userData.name,
      email: userData.email,
    });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await studentClient.post<Student>("/api/auth/register/", data);
    // Registration returns student data but no tokens; redirect to login
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
