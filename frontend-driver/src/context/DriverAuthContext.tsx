"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  driverClient,
  setDriverTokens,
  clearDriverTokens,
  getDriverAccessToken,
} from "@/api/driver-client";
import type { LoginRequest, TokenResponse } from "@/api/types";

interface DriverUser {
  user_id: number;
  name: string;
  email: string;
  driver_id?: number;
  first_name?: string;
  last_name?: string;
}

interface DriverAuthContextValue {
  user: DriverUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const DriverAuthContext = createContext<DriverAuthContextValue | null>(null);

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const ALLOWED_DRIVER_ROLES = ["Driver", "Admin"];

async function fetchDriverProfile(): Promise<Partial<DriverUser>> {
  try {
    const res = await driverClient.get<{
      driver_id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      user?: { user_id: number; name: string; email: string; role: string };
    }>("/api/drivers/me/");
    const d = res.data;
    return {
      driver_id: d.driver_id,
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

export function DriverAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DriverUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getDriverAccessToken();
      if (token) {
        const payload = parseJwt(token);
        if (payload) {
          const role = payload.role as string | undefined;
          if (role && !ALLOWED_DRIVER_ROLES.includes(role)) {
            clearDriverTokens();
            setIsLoading(false);
            return;
          }
          const base: DriverUser = {
            user_id: payload.user_id as number,
            name: (payload.name as string) ?? "",
            email: (payload.email as string) ?? "",
          };
          if (typeof payload.driver_id === "number") {
            base.driver_id = payload.driver_id as number;
          }
          setUser(base);
          const profile = await fetchDriverProfile();
          setUser((prev) => (prev ? { ...prev, ...profile } : prev));
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await driverClient.post<TokenResponse>("/api/auth/login/", data);
    const { access, refresh, user: userData } = response.data;

    const payload = parseJwt(access);
    const role = payload?.role as string | undefined;

    if (role && !ALLOWED_DRIVER_ROLES.includes(role)) {
      throw new Error("Access denied: this portal is for drivers only.");
    }

    setDriverTokens(access, refresh);

    const base: DriverUser = {
      user_id: userData.user_id,
      name: userData.name,
      email: userData.email,
    };
    if (typeof payload?.driver_id === "number") {
      base.driver_id = payload.driver_id as number;
    }
    setUser(base);

    const profile = await fetchDriverProfile();
    setUser((prev) => (prev ? { ...prev, ...profile } : prev));
  }, []);

  const logout = useCallback(() => {
    clearDriverTokens();
    setUser(null);
  }, []);

  return (
    <DriverAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
}

export function useDriverAuth(): DriverAuthContextValue {
  const ctx = useContext(DriverAuthContext);
  if (!ctx) throw new Error("useDriverAuth must be used within DriverAuthProvider");
  return ctx;
}
