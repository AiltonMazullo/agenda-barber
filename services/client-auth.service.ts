import { api, ApiError } from "@/lib/api";
import {
  clientApi,
  clearClientAuthTokens,
  getClientAccessToken,
  setClientAuthTokens,
} from "@/lib/client-api";
import type { Client, UpdateMePayload } from "@/types/client.types";
import type {
  ClientAuthSession,
  ClientAuthTokens,
  ClientLoginCredentials,
  ClientRegisterPayload,
} from "@/types/client-auth.types";

const CLIENT_CACHE_KEY = "sm_client";

export function setCachedClient(client: Client): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(client));
}

function getCachedClient(): Client | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CLIENT_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Client;
  } catch {
    return null;
  }
}

/** Decodifica o `sub` (clientId) do accessToken JWT, sem validar assinatura. */
function decodeClientIdFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { sub?: string };
    return json.sub ?? null;
  } catch {
    return null;
  }
}

/** Monta um Client mínimo a partir do token + credenciais (fallback). */
function fallbackClient(
  tokens: ClientAuthTokens,
  barbershopId: string,
  email: string,
): Client {
  const id = decodeClientIdFromToken(tokens.accessToken) ?? "";
  const cached = getCachedClient();
  if (cached && cached.id === id) return cached;
  return {
    id,
    name: email.split("@")[0] ?? "Cliente",
    email,
    phone: null,
    birthDate: null,
    howMet: null,
    notes: null,
    remindInSchedule: false,
    photoUrl: null,
    cpf: null,
    cep: null,
    street: null,
    neighborhood: null,
    city: null,
    uf: null,
    number: null,
    complement: null,
    barbershopId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const clientAuthService = {
  async login(credentials: ClientLoginCredentials): Promise<ClientAuthSession> {
    const { data: tokens } = await clientApi.post<ClientAuthTokens>(
      `/barbershops/${credentials.barbershopId}/clients/login`,
      { email: credentials.email, password: credentials.password },
    );
    setClientAuthTokens(tokens);

    // Busca o perfil completo do cliente autenticado; fallback se falhar.
    let client: Client;
    try {
      const { data } = await clientApi.get<Client>("/clients/me");
      client = data;
    } catch {
      client = fallbackClient(
        tokens,
        credentials.barbershopId,
        credentials.email,
      );
    }
    setCachedClient(client);

    return { client, tokens };
  },

  async register(payload: ClientRegisterPayload): Promise<ClientAuthSession> {
    const { barbershopId, ...body } = payload;
    // Rota pública — usa `api` (sem token de cliente). Retorna o Client criado.
    const { data: client } = await api.post<Client>(
      `/barbershops/${barbershopId}/clients/register`,
      body,
    );

    // Autentica para obter os tokens.
    const { data: tokens } = await clientApi.post<ClientAuthTokens>(
      `/barbershops/${barbershopId}/clients/login`,
      { email: payload.email, password: payload.password },
    );
    setClientAuthTokens(tokens);
    setCachedClient(client);

    return { client, tokens };
  },

  async logout(): Promise<void> {
    clearClientAuthTokens();
  },

  /**
   * Restaura a sessão no boot. Tenta o perfil fresco em `/clients/me`. Se o
   * token for inválido/expirado (401/403/404), limpa a sessão e devolve null.
   * Para erros de rede, cai no cache para não deslogar o usuário à toa.
   */
  async me(): Promise<Client | null> {
    if (!getClientAccessToken()) return null;
    try {
      const { data } = await clientApi.get<Client>("/clients/me");
      setCachedClient(data);
      return data;
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 401 || err.status === 403 || err.status === 404)
      ) {
        clearClientAuthTokens();
        return null;
      }
      return getCachedClient();
    }
  },

  /**
   * Atualiza o cadastro do próprio cliente via `PUT /clients/me`. Envia só os
   * campos preenchidos e atualiza o cache local com o retorno.
   */
  async updateMe(payload: UpdateMePayload): Promise<Client> {
    const { data } = await clientApi.put<Client>("/clients/me", payload);
    setCachedClient(data);
    return data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/client/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/client/reset-password", { token, password });
  },
};
