/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { barbershopsService } from "@/services/barbershops.service";
import { ApiError } from "@/lib/api";
import type { Barbershop } from "@/types/barbershop.types";

interface PublicBarbershopContextValue {
  barbershop: Barbershop | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

const PublicBarbershopContext =
  createContext<PublicBarbershopContextValue | null>(null);

interface PublicBarbershopProviderProps {
  slug: string;
  children: ReactNode;
}

export function PublicBarbershopProvider({
  slug,
  children,
}: PublicBarbershopProviderProps) {
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    barbershopsService
      .getBySlug(slug)
      .then((b) => {
        if (active) setBarbershop(b);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar a barbearia.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <PublicBarbershopContext.Provider
      value={{ barbershop, isLoading, error, notFound }}
    >
      {children}
    </PublicBarbershopContext.Provider>
  );
}

export function usePublicBarbershop(): PublicBarbershopContextValue {
  const ctx = useContext(PublicBarbershopContext);
  if (!ctx) {
    throw new Error(
      "usePublicBarbershop deve ser usado dentro de <PublicBarbershopProvider>",
    );
  }
  return ctx;
}
