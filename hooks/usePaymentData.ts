/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { paymentDataService } from "@/services/payment-data.service";
import type {
  CreatePaymentDataPayload,
  PaymentData,
  UpdatePaymentDataPayload,
} from "@/types/payment-data.types";

export function usePaymentData(barbershopId: string | undefined) {
  const [data, setData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    paymentDataService
      .get(barbershopId)
      .then((d) => {
        if (active) setData(d);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  const save = useCallback(
    async (
      payload: CreatePaymentDataPayload | UpdatePaymentDataPayload,
    ): Promise<PaymentData | null> => {
      if (!barbershopId) return null;
      try {
        const saved = data
          ? await paymentDataService.update(
              barbershopId,
              payload as UpdatePaymentDataPayload,
            )
          : await paymentDataService.create(
              barbershopId,
              payload as CreatePaymentDataPayload,
            );
        setData(saved);
        toast.success("Credenciais salvas.");
        return saved;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao salvar credenciais.",
        );
        return null;
      }
    },
    [barbershopId, data],
  );

  const remove = useCallback(async () => {
    if (!barbershopId || !data) return false;
    try {
      await paymentDataService.remove(barbershopId);
      setData(null);
      toast.success("Credenciais removidas.");
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao remover credenciais.",
      );
      return false;
    }
  }, [barbershopId, data]);

  return { data, isLoading, save, remove };
}
