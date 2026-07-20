"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { subscriptionsService } from "@/services/subscriptions.service";
import type {
  SubscriptionBillingType,
  SubscriptionContractsResult,
} from "@/types/subscription.types";

export function useSubscriptionContracts(
  barbershopId: string | undefined,
  filters: { billingType?: SubscriptionBillingType; planId?: string; status?: string } = {},
) {
  const [result, setResult] = useState<SubscriptionContractsResult>({
    contracts: [],
    totals: { gateway: 0, manual: 0, total: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const { billingType, planId, status } = filters;

  const fetchContracts = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await subscriptionsService.getContracts(barbershopId, {
        billingType,
        planId,
        status,
      });
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar contratos.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId, billingType, planId, status]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchContracts();
  }, [barbershopId, fetchContracts]);

  return { ...result, isLoading, refetch: fetchContracts };
}
