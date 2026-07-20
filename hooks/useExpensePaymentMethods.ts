"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { expensePaymentMethodsService } from "@/services/expense-payment-methods.service";
import type {
  CreateExpensePaymentMethodPayload,
  ExpensePaymentMethod,
} from "@/types/expense-payment-method.types";

export function useExpensePaymentMethods(barbershopId: string | undefined) {
  const [methods, setMethods] = useState<ExpensePaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMethods = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await expensePaymentMethodsService.list(barbershopId);
      setMethods(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar formas de pagamento.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchMethods();
  }, [barbershopId, fetchMethods]);

  const create = useCallback(
    async (payload: CreateExpensePaymentMethodPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await expensePaymentMethodsService.create(barbershopId, payload);
        toast.success("Forma de pagamento cadastrada.");
        await fetchMethods();
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao cadastrar forma de pagamento.");
        return null;
      }
    },
    [barbershopId, fetchMethods],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await expensePaymentMethodsService.remove(barbershopId, id);
        toast.success("Forma de pagamento removida.");
        await fetchMethods();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao remover forma de pagamento.");
        return false;
      }
    },
    [barbershopId, fetchMethods],
  );

  return { methods, isLoading, create, remove };
}
