export type UserRole = "owner" | "admin" | "professional" | "receptionist";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  empresaId: string;
  avatarUrl?: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  password: string;
}
