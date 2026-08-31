"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { financialEntriesService } from "@/services/financial-entries.service";
import type {
  CreateFinancialEntryPayload,
  FinancialEntry,
  FinancialEntryFilters,
} from "@/types/financial-entry.types";

export function useFinancialEntries(
  barbershopId: string | undefined,
  filters: FinancialEntryFilters = {},
  // spec-ajustes-escopo-2 §2.4: opcional — sem paginação, mantém o
  // comportamento legado (busca a lista inteira, `total` vem `null`).
  pagination?: { page: number; pageSize: number },
) {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const filtersKey = JSON.stringify(filters);
  const paginationKey = JSON.stringify(pagination);

  const fetchEntries = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const result = await financialEntriesService.list(barbershopId, filters, pagination);
      setEntries(result.data);
      setTotal(result.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar lançamentos.");
    } finally {
      setIsLoading(false);

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbershopId, filtersKey, paginationKey]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchEntries();
  }, [barbershopId, fetchEntries]);

  const create = useCallback(
    async (payload: CreateFinancialEntryPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await financialEntriesService.create(barbershopId, payload);
        toast.success(payload.type === "PAYABLE" ? "Despesa cadastrada." : "Receita cadastrada.");
        await fetchEntries();
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao cadastrar lançamento.");
        return null;
      }
    },
    [barbershopId, fetchEntries],
  );

  const markPaid = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await financialEntriesService.markPaid(barbershopId, id);
        toast.success("Lançamento marcado como pago.");
        await fetchEntries();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao marcar como pago.");
        return false;
      }
    },
    [barbershopId, fetchEntries],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await financialEntriesService.remove(barbershopId, id);
        toast.success("Lançamento removido.");
        await fetchEntries();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao remover lançamento.");
        return false;
      }
    },
    [barbershopId, fetchEntries],
  );

  return { entries, total, isLoading, create, markPaid, remove, refetch: fetchEntries };
}
