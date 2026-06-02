"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clientAuthService } from "@/services/client-auth.service";
import type { Client, UpdateMePayload } from "@/types/client.types";
import type {
  ClientLoginCredentials,
  ClientRegisterPayload,
} from "@/types/client-auth.types";

interface ClientAuthContextValue {
  client: Client | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: ClientLoginCredentials) => Promise<Client>;
  register: (payload: ClientRegisterPayload) => Promise<Client>;
  updateProfile: (payload: UpdateMePayload) => Promise<Client>;
  logout: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextValue | null>(null);

interface ClientAuthProviderProps {
  children: ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    clientAuthService
      .me()
      .then((c) => {
        if (!cancelled) setClient(c);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: ClientLoginCredentials) => {
    const session = await clientAuthService.login(credentials);
    setClient(session.client);
    return session.client;
  }, []);

  const register = useCallback(async (payload: ClientRegisterPayload) => {
    const session = await clientAuthService.register(payload);
    setClient(session.client);
    return session.client;
  }, []);

  const updateProfile = useCallback(async (payload: UpdateMePayload) => {
    const updated = await clientAuthService.updateMe(payload);
    setClient(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    await clientAuthService.logout();
    setClient(null);
  }, []);

  return (
    <ClientAuthContext.Provider
      value={{
        client,
        isAuthenticated: client !== null,
        isLoading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuthContext(): ClientAuthContextValue {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error(
      "useClientAuthContext deve ser usado dentro de <ClientAuthProvider>",
    );
  }
  return ctx;
}
