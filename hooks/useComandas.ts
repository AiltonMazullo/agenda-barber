/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { comandasStore } from "@/lib/comandas-store";
import type {
  Comanda,
  ComandaDraft,
  ComandaStatus,
} from "@/types/orders.types";

const STATUS_TOAST: Record<ComandaStatus, string> = {
  ABERTA: "Comanda reaberta.",
  FECHADA: "Comanda fechada.",
  CANCELADA: "Comanda cancelada.",
};

/**
 * CRUD de comandas da barbearia (persistência local — ver comandas-store).
 * Mesma interface dos hooks de API: quando o backend expor as rotas, só a
 * implementação interna muda.
 */
export function useComandas(barbershopId: string | undefined) {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    setComandas(comandasStore.list(barbershopId));
    setIsLoading(false);
  }, [barbershopId]);

  const create = useCallback(
    (draft: ComandaDraft): Comanda | null => {
      if (!barbershopId) return null;
      const created = comandasStore.create(barbershopId, draft);
      setComandas(comandasStore.list(barbershopId));
      toast.success(`Comanda #${created.numero} criada.`);
      return created;
    },
    [barbershopId],
  );

  const update = useCallback(
    (id: string, draft: ComandaDraft): Comanda | null => {
      if (!barbershopId) return null;
      const updated = comandasStore.update(barbershopId, id, draft);
      if (!updated) {
        toast.error("Comanda não encontrada.");
        return null;
      }
      setComandas(comandasStore.list(barbershopId));
      toast.success(`Comanda #${updated.numero} atualizada.`);
      return updated;
    },
    [barbershopId],
  );

  const setStatus = useCallback(
    (id: string, status: ComandaStatus): Comanda | null => {
      if (!barbershopId) return null;
      const updated = comandasStore.setStatus(barbershopId, id, status);
      if (!updated) {
        toast.error("Comanda não encontrada.");
        return null;
      }
      setComandas(comandasStore.list(barbershopId));
      toast.success(STATUS_TOAST[status]);
      return updated;
    },
    [barbershopId],
  );

  const remove = useCallback(
    (id: string): void => {
      if (!barbershopId) return;
      comandasStore.remove(barbershopId, id);
      setComandas(comandasStore.list(barbershopId));
      toast.success("Comanda excluída.");
    },
    [barbershopId],
  );

  return { comandas, isLoading, create, update, setStatus, remove };
}
