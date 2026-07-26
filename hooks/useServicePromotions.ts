"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { servicePromotionService } from "@/services/service-promotion.service";
import type {
  CreateServicePromotionPayload,
  ServicePromotion,
  UpdateServicePromotionPayload,
} from "@/types/service-promotion.types";

export function useServicePromotions(barbershopId: string | undefined) {
  const [promotions, setPromotions] = useState<ServicePromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await servicePromotionService.list(barbershopId);
      setPromotions(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar promoções.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: CreateServicePromotionPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await servicePromotionService.create(
          barbershopId,
          payload,
        );
        setPromotions((prev) => [created, ...prev]);
        toast.success("Promoção criada.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar promoção.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateServicePromotionPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await servicePromotionService.update(
          barbershopId,
          id,
          payload,
        );
        setPromotions((prev) => prev.map((p) => (p.id === id ? updated : p)));
        toast.success("Promoção atualizada.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar promoção.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await servicePromotionService.remove(barbershopId, id);
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        toast.success("Promoção removida.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover promoção.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { promotions, isLoading, refresh, create, update, remove };
}
