/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { clientsService } from "@/services/clients.service";
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/types/client.types";

export function useClients(barbershopId: string | undefined) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    clientsService
      .list(barbershopId)
      .then((data) => {
        if (active) setClients(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar clientes.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  const create = useCallback(
    async (payload: CreateClientPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await clientsService.create(barbershopId, payload);
        setClients((prev) => [created, ...prev]);
        toast.success("Cliente cadastrado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao cadastrar cliente.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateClientPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await clientsService.update(barbershopId, id, payload);
        setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
        toast.success("Cliente atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar cliente.",
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
        await clientsService.remove(barbershopId, id);
        setClients((prev) => prev.filter((c) => c.id !== id));
        toast.success("Cliente removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover cliente.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { clients, isLoading, create, update, remove };
}
