"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService, setCachedBarbershop } from "@/services/auth.service";
import type {
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth.types";
import type { Barbershop } from "@/types/barbershop.types";

interface AuthContextValue {
  barbershop: Barbershop | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<Barbershop>;
  register: (credentials: RegisterCredentials) => Promise<Barbershop>;
  logout: () => Promise<void>;
  updateBarbershop: (b: Barbershop) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((b) => {
        if (!cancelled) setBarbershop(b);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await authService.login(credentials);
    setBarbershop(session.barbershop);
    return session.barbershop;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const session = await authService.register(credentials);
    setBarbershop(session.barbershop);
    return session.barbershop;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setBarbershop(null);
  }, []);

  const updateBarbershop = useCallback((b: Barbershop) => {
    setBarbershop(b);
    setCachedBarbershop(b);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        barbershop,
        isAuthenticated: barbershop !== null,
        isLoading,
        login,
        register,
        logout,
        updateBarbershop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
