"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePlatformSubscription } from "@/hooks/usePlatformSubscription";

const EXEMPT_PATH = "/billing";

/**
 * Bloqueia o dashboard inteiro quando o trial expirou e não há assinatura da
 * plataforma ativa, redirecionando para a tela "Meu Plano". Espelha
 * `RequirePermission`, mas a decisão vem do backend (`isActive` já resolve
 * trial/ativo/carência de cancelamento — ver `usePlatformSubscription`).
 */
export function SubscriptionGate({ children }: { children: ReactNode }) {
  const { isBlocked, isLoading } = usePlatformSubscription();
  const pathname = usePathname();
  const router = useRouter();

  const shouldRedirect = !isLoading && isBlocked && pathname !== EXEMPT_PATH;

  useEffect(() => {
    if (shouldRedirect) router.replace(EXEMPT_PATH);
  }, [shouldRedirect, router]);

  if (shouldRedirect) return null;

  return <>{children}</>;
}
