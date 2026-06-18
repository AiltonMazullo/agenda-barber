/**
 * HTTP client central do projeto.
 *
 * Axios com interceptors:
 * - Request: injeta `Authorization: Bearer <accessToken>` lendo do localStorage.
 * - Response: em 401, tenta refresh uma vez e refaz a request original.
 *   Se o refresh também falhar, limpa as credenciais e propaga o erro.
 *
 * Helpers de mock (`mockResponse`, `mockError`) seguem disponíveis até todos
 * os domínios estarem migrados para a API real.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { translateApiError } from "@/utils/api-errors";
import { acquireSlot, releaseSlot } from "@/lib/request-queue";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ;

/**
 * Monta a URL completa de um asset servido pela API (ex.: avatar de
 * profissional, cujo `avatarUrl` vem como caminho relativo "/uploads/...").
 */
export function apiAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("blob:")) return path;
  // Proxy /uploads via Next.js API route to bypass Cross-Origin-Resource-Policy
  if (path.startsWith("/uploads/")) return `/api/img${path.slice("/uploads".length)}`;
  if (path.startsWith("http")) return path;
  return `${BASE_URL ?? ""}${path}`;
}

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
  // Evita que uma requisição travada bloqueie a fila indefinidamente.
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  // Serializa as chamadas (uma por vez) para não estourar o rate limit.
  await acquireSlot();
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    releaseSlot();
    return response;
  },
  async (error: AxiosError<ApiErrorBody>) => {
    releaseSlot();
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

// ─── Deduplicação de GETs em voo ──────────────────────────────────────────────
// Em dev o StrictMode dispara os effects duas vezes; telas também podem montar
// o mesmo hook em paralelo. Para não repetir a mesma chamada, GETs idênticos
// (mesma URL + params) compartilham a promise enquanto uma está em voo. Some do
// mapa ao resolver/rejeitar — é dedupe de requisições concorrentes, não cache.
const inflightGets = new Map<string, Promise<AxiosResponse>>();
const rawGet = api.get.bind(api);
api.get = function dedupGet(url: string, config?: AxiosRequestConfig) {
  const key = `${url}|${JSON.stringify(config?.params ?? null)}`;
  const existing = inflightGets.get(key);
  if (existing) return existing;
  const promise = rawGet(url, config).finally(() => {
    inflightGets.delete(key);
  });
  inflightGets.set(key, promise as Promise<AxiosResponse>);
  return promise;
} as typeof api.get;

// ─── Helpers de mock (mantidos enquanto migração não terminou) ────────────────

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 600;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const simulatedDelay = () =>
  MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

interface MockOptions {
  delayMs?: number;
  failRate?: number;
}

export async function mockResponse<T>(
  value: T,
  options?: MockOptions,
): Promise<T> {
  await sleep(options?.delayMs ?? simulatedDelay());
  if (options?.failRate && Math.random() < options.failRate) {
    throw new ApiError("Falha simulada", 500, "MOCK_FAILURE");
  }
  return value;
}

export async function mockError(
  message: string,
  status = 500,
  delayMs?: number,
): Promise<never> {
  await sleep(delayMs ?? simulatedDelay());
  throw new ApiError(message, status);
}

// Auxiliar para usos pontuais onde só interessa o payload sem o envelope Axios.
export async function unwrap<T>(
  promise: Promise<AxiosResponse<T>>,
): Promise<T> {
  const res = await promise;
  return res.data;
}
