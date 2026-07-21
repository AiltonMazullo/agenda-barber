import {
  api,
  clearAuthTokens,
  getAccessToken,
  setAuthTokens,
} from "@/lib/api";
import type {
  AuthSession,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth.types";
import type { Barbershop } from "@/types/barbershop.types";
import type { Employee } from "@/types/employee.types";

const SESSION_KEY = "sm_session";

type CachedSession =
  | { type: "owner"; barbershop: Barbershop }
  | { type: "employee"; barbershop: Barbershop; employee: Employee; permissions: string[] };

function setCachedSession(session: CachedSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getCachedSession(): CachedSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedSession;
  } catch {
    return null;
  }
}

export function setCachedBarbershop(barbershop: Barbershop): void {
  const current = getCachedSession();
  if (current) {
    setCachedSession({ ...current, barbershop });
    return;
  }
  setCachedSession({ type: "owner", barbershop });
}

interface LoginResponse extends AuthTokens {
  type: "owner" | "employee";
  employee?: Employee;
  barbershop?: Barbershop;
  permissions?: string[];
}

async function findBarbershopByEmail(email: string): Promise<Barbershop> {
  const { data } = await api.get<Barbershop[]>("/barbershops");
  const found = data.find(
    (b) => b.email.toLowerCase() === email.toLowerCase(),
  );
  if (!found) {
    throw new Error("Barbearia não encontrada para o email informado.");
  }
  return found;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const { data } = await api.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    setAuthTokens(tokens);

    if (data.type === "employee" && data.employee && data.barbershop && data.permissions) {
      setCachedSession({
        type: "employee",
        barbershop: data.barbershop,
        employee: data.employee,
        permissions: data.permissions,
      });
      return {
        type: "employee",
        barbershop: data.barbershop,
        employee: data.employee,
        permissions: data.permissions,
        tokens,
      };
    }

    const barbershop = await findBarbershopByEmail(credentials.email);
    setCachedSession({ type: "owner", barbershop });
    return { type: "owner", barbershop, tokens };
  },

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    await api.post<Barbershop>("/barbershops", credentials);
    return authService.login({
      email: credentials.email,
      password: credentials.password,
    });
  },

  async logout(): Promise<void> {
    try {
      await api.post<void>("/auth/logout");
    } catch {
      // logout é best-effort no servidor
    }
    clearAuthTokens();
  },

  /**
   * Sessão atual — sempre confirmada com o backend (nunca só o cache local),
   * pra refletir imediatamente qualquer alteração no grupo de acesso do
   * funcionário sem precisar dele deslogar e logar de novo.
   */
  async me(): Promise<CachedSession | null> {
    if (!getAccessToken()) return null;
    try {
      const { data } = await api.get<CachedSession>("/auth/me");
      setCachedSession(data);
      return data;
    } catch {
      // Token inválido/expirado (já tentou refresh no interceptor e falhou) —
      // trata como deslogado em vez de servir permissões desatualizadas.
      clearAuthTokens();
      return null;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/reset-password", { token, password });
  },
};
