/**
 * HTTP client para o fluxo do **cliente final** (não confundir com o dono
 * da barbearia). Mantém storage e cookie próprios para que cliente e dono
 * possam coexistir no mesmo browser sem colisão.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "@/lib/api";
import { translateApiError } from "@/utils/api-errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ACCESS_KEY = "sm_client_access_token";
const REFRESH_KEY = "sm_client_refresh_token";
const CLIENT_KEY = "sm_client";
const COOKIE_NAME = "sm_client_token";
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

export function getClientAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getClientRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setClientAuthTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  setCookie(tokens.accessToken, COOKIE_MAX_AGE_DAYS * 24 * 60 * 60);
}

export function clearClientAuthTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(CLIENT_KEY);
  clearCookie();
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

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const clientApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

clientApi.interceptors.request.use((config) => {
  const token = getClientAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

clientApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalConfig = error.config as RetriableConfig | undefined;

    const isAuthEndpoint = originalConfig?.url?.startsWith("/auth/");
    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !isAuthEndpoint
    ) {
      originalConfig._retry = true;
      const refreshToken = getClientRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post<{
            accessToken: string;
            refreshToken: string;
          }>(
            `${BASE_URL}/auth/client/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } },
          );
          setClientAuthTokens(data);
          originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
          return clientApi(originalConfig);
        } catch {
          clearClientAuthTokens();
        }
      } else {
        clearClientAuthTokens();
      }
    }

    return Promise.reject(toApiError(error));
  },
);
