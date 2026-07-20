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
        const result = await clientSubscriptionsService.subscribe(barbershopId, { planId });
        if (!result.checkoutUrl) {
          toast.error(result.errorMessage ?? "Não foi possível gerar o checkout.");
          return false;
        }
        // Redireciona pro checkout hospedado pelo gateway — a assinatura só é
        // criada de fato quando o pagamento for confirmado (webhook).
        window.location.href = result.checkoutUrl;
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao assinar o plano.");
        return false;
      }
    },
    [barbershopId],
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

  return { mySubscription, isLoading, subscribe, cancel, refresh: fetchMine };
}
