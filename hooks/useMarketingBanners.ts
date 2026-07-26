"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { marketingBannerService } from "@/services/marketing-banner.service";
import type {
  CreateMarketingBannerPayload,
  MarketingBanner,
  UpdateMarketingBannerPayload,
} from "@/types/marketing-banner.types";

export function useMarketingBanners(barbershopId: string | undefined) {
  const [banners, setBanners] = useState<MarketingBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await marketingBannerService.list(barbershopId);
      setBanners(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar banners.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: CreateMarketingBannerPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await marketingBannerService.create(
          barbershopId,
          payload,
        );
        setBanners((prev) => [created, ...prev]);
        toast.success("Banner criado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar banner.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateMarketingBannerPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await marketingBannerService.update(
          barbershopId,
          id,
          payload,
        );
        setBanners((prev) => prev.map((b) => (b.id === id ? updated : b)));
        toast.success("Banner atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar banner.",
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
        await marketingBannerService.remove(barbershopId, id);
        setBanners((prev) => prev.filter((b) => b.id !== id));
        toast.success("Banner removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover banner.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { banners, isLoading, refresh, create, update, remove };
}
