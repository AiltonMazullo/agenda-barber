"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { financialEntriesService } from "@/services/financial-entries.service";
import type { FinancialBalance } from "@/types/financial-entry.types";

const EMPTY_BALANCE: FinancialBalance = {
  payable: { overdue: 0, upcoming: 0, paid: 0, total: 0 },
  receivable: { notReceived: 0, upcoming: 0, received: 0, total: 0 },
  balance: 0,
  projectedBalance: 0,
  totalFeesInCents: 0,
};

export function useFinancialBalance(
  barbershopId: string | undefined,
  filters: {
    branchId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    description?: string;
    categoryIds?: string[];
  } = {},
) {
  const [balance, setBalance] = useState<FinancialBalance>(EMPTY_BALANCE);
  const [isLoading, setIsLoading] = useState(true);
  const filtersKey = JSON.stringify(filters);

  const fetchBalance = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await financialEntriesService.getBalance(barbershopId, filters);
      setBalance(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar balanço.");
    } finally {
      setIsLoading(false);
       
    }
  }, [barbershopId, filtersKey]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchBalance();
  }, [barbershopId, fetchBalance]);

  return { balance, isLoading, refetch: fetchBalance };
}
