"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { preCancelledClientsService } from "@/services/pre-cancelled-clients.service";
import type {
  CreatePreCancelledClientPayload,
  PreCancelledClient,
  PreCancelledStatus,
} from "@/types/pre-cancelled-client.types";

export function usePreCancelledClients(barbershopId: string | undefined) {
  const [items, setItems] = useState<PreCancelledClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(
    async (status?: PreCancelledStatus) => {
      if (!barbershopId) return;
      setIsLoading(true);
      try {
        const data = await preCancelledClientsService.list(barbershopId, status);
        setItems(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao carregar pré-cancelados.");
      } finally {
        setIsLoading(false);
      }
    },
    [barbershopId],
  );

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchItems();
  }, [barbershopId, fetchItems]);

  const create = useCallback(
    async (payload: CreatePreCancelledClientPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await preCancelledClientsService.create(barbershopId, payload);
        toast.success("Cancelamento agendado.");
        await fetchItems();
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao agendar cancelamento.");
        return null;
      }
    },
    [barbershopId, fetchItems],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await preCancelledClientsService.remove(barbershopId, id);
        toast.success("Registro removido.");
        await fetchItems();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao remover registro.");
        return false;
      }
    },
    [barbershopId, fetchItems],
  );

  return { items, isLoading, fetchItems, create, remove };
}
