"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { clientSubscriptionsService } from "@/services/client-subscriptions.service";
import type { MySubscription } from "@/types/subscription.types";

export function useClientSubscription(barbershopId: string | undefined) {
  const [mySubscription, setMySubscription] = useState<MySubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMine = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await clientSubscriptionsService.me(barbershopId);
      setMySubscription(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar sua assinatura.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchMine();
  }, [barbershopId, fetchMine]);

  const subscribe = useCallback(
    async (planId: string) => {
      if (!barbershopId) return false;
      try {
        await clientSubscriptionsService.subscribe(barbershopId, { planId });
        toast.success("Assinatura ativada!");
        await fetchMine();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao assinar o plano.");
        return false;
      }
    },
    [barbershopId, fetchMine],
  );

  const cancel = useCallback(async () => {
    if (!barbershopId) return false;
    try {
      await clientSubscriptionsService.cancel(barbershopId);
      toast.success("Assinatura cancelada.");
      await fetchMine();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cancelar assinatura.");
      return false;
    }
  }, [barbershopId, fetchMine]);

  return { mySubscription, isLoading, subscribe, cancel };
}
