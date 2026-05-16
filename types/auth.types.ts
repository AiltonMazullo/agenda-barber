import type {
  Barbershop,
  CreateBarbershopPayload,
} from "@/types/barbershop.types";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  barbershop: Barbershop;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type RegisterCredentials = CreateBarbershopPayload;
