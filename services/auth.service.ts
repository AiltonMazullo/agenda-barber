import { mockResponse, mockError } from "@/lib/api";
import type {
  LoginCredentials,
  RegisterCredentials,
  Session,
  User,
} from "@/types/auth.types";

const SESSION_STORAGE_KEY = "smart-man:session";
const SESSION_COOKIE_KEY = "sm_token";
const SESSION_DAYS = 7;

const FAKE_USER: User = {
  id: "u_owner",
  nome: "José",
  email: "jose@barbearia.com",
  role: "owner",
  empresaId: "emp_1",
};

function setSessionCookie(token: string): void {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  ).toUTCString();
  document.cookie = `${SESSION_COOKIE_KEY}=${token}; expires=${expires}; path=/; samesite=lax`;
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function persistSession(session: Session): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  setSessionCookie(session.token);
}

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (new Date(parsed.expiresAt).getTime() < Date.now()) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  clearSessionCookie();
}

function buildSession(user: User): Session {
  return {
    user,
    token: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    expiresAt: new Date(
      Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<Session> {
    if (!credentials.email || !credentials.password) {
      return mockError("Email e senha são obrigatórios", 400);
    }
    if (credentials.password.length < 6) {
      return mockError("Senha inválida", 401);
    }

    const session = await mockResponse<Session>(
      buildSession({ ...FAKE_USER, email: credentials.email }),
    );
    persistSession(session);
    return session;
  },

  async register(credentials: RegisterCredentials): Promise<Session> {
    if (!credentials.email || !credentials.password || !credentials.nome) {
      return mockError("Todos os campos são obrigatórios", 400);
    }
    if (credentials.password.length < 6) {
      return mockError("Senha deve ter pelo menos 6 caracteres", 400);
    }

    const session = await mockResponse<Session>(
      buildSession({
        ...FAKE_USER,
        nome: credentials.nome,
        email: credentials.email,
      }),
    );
    persistSession(session);
    return session;
  },

  async logout(): Promise<void> {
    clearSession();
    await mockResponse(undefined, { delayMs: 100 });
  },

  async me(): Promise<User | null> {
    const session = readSession();
    if (!session) return null;
    return mockResponse(session.user, { delayMs: 100 });
  },

  async forgotPassword(email: string): Promise<void> {
    if (!email) return mockError("Email obrigatório", 400);
    await mockResponse(undefined);
  },

  getCurrentSession(): Session | null {
    return readSession();
  },
};
