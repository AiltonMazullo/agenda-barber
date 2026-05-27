import type { Client } from "@/types/client.types";

export interface ClientAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ClientAuthSession {
  client: Client;
  tokens: ClientAuthTokens;
}

export interface ClientLoginCredentials {
  email: string;
  password: string;
  barbershopId: string;
}

export interface ClientRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  barbershopId: string;
}
