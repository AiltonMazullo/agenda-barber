"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { clientBlockService } from "@/services/client-block.service";
import type {
  ClientBlock,
  CreateClientBlockPayload,
} from "@/types/client-block.types";

export function useClientBlocks(barbershopId: string | undefined) {
  const [blocks, setBlocks] = useState<ClientBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await clientBlockService.list(barbershopId);
      setBlocks(data);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Falha ao carregar clientes bloqueados.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: CreateClientBlockPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await clientBlockService.create(barbershopId, payload);
        setBlocks((prev) => [created, ...prev]);
        toast.success("Bloqueio cadastrado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao cadastrar bloqueio.",
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
        await clientBlockService.remove(barbershopId, id);
        setBlocks((prev) => prev.filter((b) => b.id !== id));
        toast.success("Bloqueio removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover bloqueio.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { blocks, isLoading, refresh, create, remove };
}
