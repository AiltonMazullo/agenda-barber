"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { paymentMethodsService } from "@/services/payment-methods.service";
import type {
  BranchConfigInput,
  CreatePaymentMethodPayload,
  PaymentMethodConfig,
} from "@/types/payment-method.types";

export function usePaymentMethods(barbershopId: string | undefined) {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMethods = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await paymentMethodsService.list(barbershopId);
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
    async (payload: CreatePaymentMethodPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await paymentMethodsService.create(barbershopId, payload);
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

  const updateBranchConfigs = useCallback(
    async (id: string, configs: BranchConfigInput[]) => {
      if (!barbershopId) return null;
      try {
        const updated = await paymentMethodsService.updateBranchConfigs(barbershopId, id, configs);
        toast.success("Configuração por filial atualizada.");
        await fetchMethods();
        return updated;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao atualizar configuração.");
        return null;
      }
    },
    [barbershopId, fetchMethods],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await paymentMethodsService.remove(barbershopId, id);
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

  return { methods, isLoading, create, updateBranchConfigs, remove };
}
