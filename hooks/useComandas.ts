"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { comandasService } from "@/services/comandas.service";
import type { Comanda, ComandaDraft, ComandaStatus } from "@/types/orders.types";

const STATUS_TOAST: Record<ComandaStatus, string> = {
  ABERTA: "Comanda reaberta.",
  FECHADA: "Comanda fechada.",
  CANCELADA: "Comanda cancelada.",
};

interface UseComandasFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: ComandaStatus;
  search?: string;
}

/**
 * CRUD de comandas da barbearia, integrado com a API real.
 * spec-ajustes-escopo-2 §2.4: `pagination` é opcional — sem ele, busca a
 * lista inteira (`total` vem `null`), mesmo padrão de `useFinancialEntries`.
 */
export function useComandas(
  barbershopId: string | undefined,
  filters?: UseComandasFilters,
  pagination?: { page: number; pageSize: number },
) {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { dateFrom, dateTo, status, search } = filters ?? {};
  const paginationKey = JSON.stringify(pagination);

  const fetchComandas = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const result = await comandasService.list(barbershopId, {
        dateFrom,
        dateTo,
        status,
        search,
        ...pagination,
      });
      setComandas(result.data);
      setTotal(result.total);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar comandas.",
      );
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbershopId, dateFrom, dateTo, status, search, paginationKey]);

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
      pagamentos?: { cashRegisterId: string; paymentMethodId: string; valorInCents: number }[],
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

  return { comandas, total, isLoading, create, update, setStatus, remove, refetch: fetchComandas };
}
