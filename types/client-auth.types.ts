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
  phone: string;
  /** ISO 8601. */
  birthDate: string;
  howMet: string;
  cpf?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
  barbershopId: string;
}
