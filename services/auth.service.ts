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

const BARBERSHOP_KEY = "sm_barbershop";

export function setCachedBarbershop(barbershop: Barbershop): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BARBERSHOP_KEY, JSON.stringify(barbershop));
}

function getCachedBarbershop(): Barbershop | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BARBERSHOP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Barbershop;
  } catch {
    return null;
  }
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
    const { data: tokens } = await api.post<AuthTokens>(
      "/auth/login",
      credentials,
    );
    setAuthTokens(tokens);

    const barbershop = await findBarbershopByEmail(credentials.email);
    setCachedBarbershop(barbershop);

    return { barbershop, tokens };
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

  async me(): Promise<Barbershop | null> {
    if (!getAccessToken()) return null;
    return getCachedBarbershop();
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/reset-password", { token, password });
  },
};
