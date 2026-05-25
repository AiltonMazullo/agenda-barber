/**
 * HTTP client central do projeto.
 *
 * Axios com interceptors:
 * - Request: injeta `Authorization: Bearer <accessToken>` lendo do localStorage.
 * - Response: em 401, tenta refresh uma vez e refaz a request original.
 *   Se o refresh também falhar, limpa as credenciais e propaga o erro.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { translateApiError } from "@/utils/api-errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ;

// ─── Token storage (chaves compartilhadas com services/auth.service.ts) ───────

const ACCESS_KEY = "sm_access_token";
const REFRESH_KEY = "sm_refresh_token";
const COOKIE_NAME = "sm_token";
const COOKIE_MAX_AGE_DAYS = 7;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function setCookie(value: string, maxAgeSeconds: number): void {
  if (!isBrowser()) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearCookie(): void {
  if (!isBrowser()) return;
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  setCookie(tokens.accessToken, COOKIE_MAX_AGE_DAYS * 24 * 60 * 60);
}

export function clearAuthTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem("sm_barbershop");
  clearCookie();
}

// ─── ApiError ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status?: number,
    code?: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

interface ApiErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

function toApiError(err: AxiosError<ApiErrorBody>): ApiError {
  const status = err.response?.status;
  const body = err.response?.data;
  const rawMessage = body?.message ?? err.message ?? "";
  const message = translateApiError(rawMessage, status, body?.errors);
  return new ApiError(message, status, body?.code, body?.errors);
}

// ─── Axios instance ───────────────────────────────────────────────────────────

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalConfig = error.config as RetriableConfig | undefined;

    // 401 → tenta refresh uma única vez
    const isAuthEndpoint = originalConfig?.url?.startsWith("/auth/");
    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !isAuthEndpoint
    ) {
      originalConfig._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post<{
            accessToken: string;
            refreshToken: string;
          }>(
            `${BASE_URL}/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } },
          );
          setAuthTokens(data);
          originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalConfig);
        } catch {
          clearAuthTokens();
        }
      } else {
        clearAuthTokens();
      }
    }

    return Promise.reject(toApiError(error));
  },
);

