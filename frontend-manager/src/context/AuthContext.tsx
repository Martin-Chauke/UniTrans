"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "@/api";
import { clearTokens, getAccessToken, setTokens } from "@/api/client";
import type { User, LoginRequest, ManagerRegisterRequest } from "@/api/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  registerManager: (data: ManagerRegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const ALLOWED_ROLES: Array<User["role"]> = ["Admin", "TransportManager"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        const role = payload.role as User["role"];
        if (ALLOWED_ROLES.includes(role)) {
          setUser({
            user_id: payload.user_id as number,
            name: (payload.name as string) ?? "",
            email: (payload.email as string) ?? "",
            role,
            date_joined: "",
          });
        } else {
          clearTokens();
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const role = response.user.role;
    if (!role || !ALLOWED_ROLES.includes(role)) {
      clearTokens();
      throw new Error("Access denied: this portal is for managers only.");
    }
    setUser(response.user);
  }, []);

  const registerManager = useCallback(async (data: ManagerRegisterRequest) => {
    const response = await authApi.registerManager(data);
    setTokens(response.access, response.refresh);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        registerManager,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
