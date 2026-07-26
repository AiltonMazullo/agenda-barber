"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { clientRepurchaseService } from "@/services/client-repurchase.service";
import type { ClientRepurchase } from "@/types/client-repurchase.types";

export function useClientRepurchases(barbershopId: string | undefined) {
  const [repurchases, setRepurchases] = useState<ClientRepurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await clientRepurchaseService.list(barbershopId);
      setRepurchases(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar recompras.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await clientRepurchaseService.remove(barbershopId, id);
        setRepurchases((prev) => prev.filter((r) => r.id !== id));
        toast.success("Recompra removida.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover recompra.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { repurchases, isLoading, refresh, remove };
}
