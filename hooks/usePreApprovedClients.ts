"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { preApprovedClientsService } from "@/services/pre-approved-clients.service";
import type {
  CreatePreApprovedClientPayload,
  PreApprovalStatus,
  PreApprovedClient,
} from "@/types/pre-approved-client.types";

export function usePreApprovedClients(barbershopId: string | undefined) {
  const [items, setItems] = useState<PreApprovedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(
    async (status?: PreApprovalStatus) => {
      if (!barbershopId) return;
      setIsLoading(true);
      try {
        const data = await preApprovedClientsService.list(barbershopId, status);
        setItems(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao carregar pré-aprovados.");
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
    async (payload: CreatePreApprovedClientPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await preApprovedClientsService.create(barbershopId, payload);
        toast.success("Cliente pré-aprovado cadastrado.");
        await fetchItems();
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao cadastrar pré-aprovado.");
        return null;
      }
    },
    [barbershopId, fetchItems],
  );

  const resendLink = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await preApprovedClientsService.resendLink(barbershopId, id);
        toast.success("Link de checkout gerado.");
        await fetchItems();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao gerar link.");
        return false;
      }
    },
    [barbershopId, fetchItems],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await preApprovedClientsService.remove(barbershopId, id);
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

  return { items, isLoading, fetchItems, create, resendLink, remove };
}
