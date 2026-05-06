/**
 * HTTP client central do projeto.
 *
 * Hoje o backend ainda não existe — todos os services usam `mockResponse`
 * para simular latência e shape de resposta. Quando a API real entrar:
 *
 *   1. Setar `NEXT_PUBLIC_API_URL` no .env
 *   2. Trocar chamadas de `mockResponse(...)` por `api.get/post/put/...`
 *      dentro dos services. Componentes não mudam.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 600;

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const simulatedDelay = () =>
  MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });

  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    try {
      const data = (await response.json()) as { message?: string; code?: string };
      message = data.message ?? message;
      code = data.code;
    } catch {
      // body não é JSON — manter statusText como mensagem
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};

interface MockOptions {
  delayMs?: number;
  failRate?: number;
}

/** Resolve com `value` após delay simulado — substituto temporário da API real. */
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

/** Rejeita com ApiError após delay simulado — útil para testar UI de erro. */
export async function mockError(
  message: string,
  status = 500,
  delayMs?: number,
): Promise<never> {
  await sleep(delayMs ?? simulatedDelay());
  throw new ApiError(message, status);
}
