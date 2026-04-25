import { client, setTokens } from "@/api/client";
import type {
  LoginRequest,
  RegisterRequest,
  TokenRefreshRequest,
  TokenRefresh,
  TokenResponse,
  Student,
} from "@/api/types";

/**
 * POST /api/auth/login/
 * Obtain JWT access + refresh tokens.
 * Automatically persists tokens to localStorage.
 */
export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  const response = await client.post<TokenResponse>("/api/auth/login/", data);
  setTokens(response.data.access, response.data.refresh);
  return response.data;
};

/**
 * POST /api/auth/register/
 * Register a new student account.
 */
export const register = (data: RegisterRequest) =>
  client.post<Student>("/api/auth/register/", data);

/**
 * POST /api/auth/token/refresh/
 * Exchange a refresh token for a new access token.
 */
export const refreshToken = (data: TokenRefreshRequest) =>
  client.post<TokenRefresh>("/api/auth/token/refresh/", data);
