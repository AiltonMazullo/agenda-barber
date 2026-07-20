"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { platformSubscriptionService } from "@/services/platform-subscription.service";
import type { PlatformSubscriptionMe } from "@/types/platform-subscription.types";

interface UsePlatformSubscriptionResult {
  subscription: PlatformSubscriptionMe | null;
  isLoading: boolean;
  /** true quando o acesso deve ser bloqueado (trial expirado e sem assinatura ativa). */
  isBlocked: boolean;
  refetch: () => Promise<void>;
}

export function usePlatformSubscription(): UsePlatformSubscriptionResult {
  const { isAuthenticated } = useAuthContext();
  const [subscription, setSubscription] = useState<PlatformSubscriptionMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await platformSubscriptionService.me();
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    subscription,
    isLoading,
    isBlocked: subscription ? !subscription.isActive : false,
    refetch,
  };
}
