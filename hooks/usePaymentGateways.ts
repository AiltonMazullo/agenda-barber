"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { paymentGatewaysService } from "@/services/payment-gateways.service";
import type {
  CreatePaymentGatewayPayload,
  GatewayProvider,
  PaymentGatewayConfig,
  UpdatePaymentGatewayPayload,
} from "@/types/payment-gateways.types";

export function usePaymentGateways(barbershopId: string | undefined) {
  const [configs, setConfigs] = useState<PaymentGatewayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await paymentGatewaysService.list(barbershopId);
      setConfigs(data);
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    paymentGatewaysService
      .list(barbershopId)
      .then((data) => {
        if (active) setConfigs(data);
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
      provider: GatewayProvider,
      payload: CreatePaymentGatewayPayload | UpdatePaymentGatewayPayload,
      existing: boolean,
    ): Promise<boolean> => {
      if (!barbershopId) return false;
      try {
        if (existing) {
          await paymentGatewaysService.update(
            barbershopId,
            provider,
            payload as UpdatePaymentGatewayPayload,
          );
        } else {
          await paymentGatewaysService.create(
            barbershopId,
            payload as CreatePaymentGatewayPayload,
          );
        }
        toast.success("Credenciais salvas.");
        await reload();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao salvar credenciais.");
        return false;
      }
    },
    [barbershopId, reload],
  );

  const remove = useCallback(
    async (provider: GatewayProvider): Promise<boolean> => {
      if (!barbershopId) return false;
      try {
        await paymentGatewaysService.remove(barbershopId, provider);
        toast.success("Gateway removido.");
        await reload();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao remover gateway.");
        return false;
      }
    },
    [barbershopId, reload],
  );

  const activate = useCallback(
    async (provider: GatewayProvider): Promise<boolean> => {
      if (!barbershopId) return false;
      try {
        await paymentGatewaysService.activate(barbershopId, provider);
        toast.success(`${provider} ativado para novas cobranças.`);
        await reload();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao ativar gateway.");
        return false;
      }
    },
    [barbershopId, reload],
  );

  const testConnection = useCallback(
    async (provider: GatewayProvider) => {
      if (!barbershopId) return null;
      try {
        const result = await paymentGatewaysService.test(barbershopId, provider);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
        await reload();
        return result;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao testar conexão.");
        return null;
      }
    },
    [barbershopId, reload],
  );

  return { configs, isLoading, save, remove, activate, testConnection };
}
