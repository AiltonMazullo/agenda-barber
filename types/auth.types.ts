import type {
  Barbershop,
  CreateBarbershopPayload,
} from "@/types/barbershop.types";
import type { Employee } from "@/types/employee.types";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthSession =
  | { type: "owner"; barbershop: Barbershop; tokens: AuthTokens }
  | {
      type: "employee";
      barbershop: Barbershop;
      employee: Employee;
      permissions: string[];
      tokens: AuthTokens;
    };

export interface LoginCredentials {
  email: string;
  password: string;
}

export type RegisterCredentials = CreateBarbershopPayload;
