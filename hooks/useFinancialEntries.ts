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
) {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filtersKey = JSON.stringify(filters);

  const fetchEntries = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await financialEntriesService.list(barbershopId, filters);
      setEntries(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar lançamentos.");
    } finally {
      setIsLoading(false);
       
    }
  }, [barbershopId, filtersKey]);

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

  return { entries, isLoading, create, markPaid, remove, refetch: fetchEntries };
}
