"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { comandasService } from "@/services/comandas.service";
import type {
  Comanda,
  ComandaDraft,
  ComandaPagamento,
  ComandaStatus,
} from "@/types/orders.types";

const STATUS_TOAST: Record<ComandaStatus, string> = {
  ABERTA: "Comanda reaberta.",
  FECHADA: "Comanda fechada.",
  CANCELADA: "Comanda cancelada.",
};

/** CRUD de comandas da barbearia, integrado com a API real. */
export function useComandas(
  barbershopId: string | undefined,
  dateFilter?: { dateFrom?: string; dateTo?: string },
) {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dateFrom = dateFilter?.dateFrom;
  const dateTo = dateFilter?.dateTo;

  const fetchComandas = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await comandasService.list(barbershopId, { dateFrom, dateTo });
      setComandas(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar comandas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId, dateFrom, dateTo]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchComandas();
  }, [barbershopId, fetchComandas]);

  const create = useCallback(
    async (draft: ComandaDraft): Promise<Comanda | null> => {
      if (!barbershopId) return null;
      try {
        const created = await comandasService.create(barbershopId, draft);
        toast.success(`Comanda #${created.numero} criada.`);
        await fetchComandas();
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar comanda.",
        );
        return null;
      }
    },
    [barbershopId, fetchComandas],
  );

  const update = useCallback(
    async (id: string, draft: ComandaDraft): Promise<Comanda | null> => {
      if (!barbershopId) return null;
      try {
        const updated = await comandasService.update(barbershopId, id, draft);
        toast.success(`Comanda #${updated.numero} atualizada.`);
        await fetchComandas();
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar comanda.",
        );
        return null;
      }
    },
    [barbershopId, fetchComandas],
  );

  const setStatus = useCallback(
    async (
      id: string,
      status: ComandaStatus,
      pagamentos?: Pick<ComandaPagamento, "cashRegisterId" | "formaPagamento" | "valorInCents">[],
    ): Promise<Comanda | null> => {
      if (!barbershopId) return null;
      try {
        const updated = await comandasService.setStatus(
          barbershopId,
          id,
          status,
          pagamentos,
        );
        toast.success(STATUS_TOAST[status]);
        await fetchComandas();
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar status.",
        );
        return null;
      }
    },
    [barbershopId, fetchComandas],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (!barbershopId) return;
      try {
        await comandasService.remove(barbershopId, id);
        toast.success("Comanda excluída.");
        await fetchComandas();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao excluir comanda.",
        );
      }
    },
    [barbershopId, fetchComandas],
  );

  return { comandas, isLoading, create, update, setStatus, remove };
}
