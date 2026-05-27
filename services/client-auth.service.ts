import { api } from "@/lib/api";
import {
  clientApi,
  clearClientAuthTokens,
  getClientAccessToken,
  setClientAuthTokens,
} from "@/lib/client-api";
import type { Client } from "@/types/client.types";
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

export const clientAuthService = {
  async login(credentials: ClientLoginCredentials): Promise<ClientAuthSession> {
    const { data: tokens } = await clientApi.post<ClientAuthTokens>(
      "/auth/client/login",
      credentials,
    );
    setClientAuthTokens(tokens);

    const { data: client } = await clientApi.get<Client>("/clients/me");
    setCachedClient(client);

    return { client, tokens };
  },

  async register(payload: ClientRegisterPayload): Promise<ClientAuthSession> {
    const { barbershopId, ...body } = payload;
    // Rota pública — usa `api` (sem token de cliente)
    await api.post<Client>(`/barbershops/${barbershopId}/clients`, body);
    return clientAuthService.login({
      email: payload.email,
      password: payload.password,
      barbershopId,
    });
  },

  async logout(): Promise<void> {
    try {
      await clientApi.post<void>("/auth/client/logout");
    } catch {
      // best-effort
    }
    clearClientAuthTokens();
  },

  async me(): Promise<Client | null> {
    if (!getClientAccessToken()) return null;
    // Tenta sempre buscar do servidor, fallback no cache.
    try {
      const { data } = await clientApi.get<Client>("/clients/me");
      setCachedClient(data);
      return data;
    } catch {
      return getCachedClient();
    }
  },
};
