"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { clientSubscriptionsService } from "@/services/client-subscriptions.service";
import {
  isPixAuthorizationResult,
  type MySubscription,
  type SubscribePixAuthorizationResult,
  type SubscriptionPaymentMethod,
} from "@/types/subscription.types";
import type { CancelReasonCode, PreCancelledClient } from "@/types/pre-cancelled-client.types";

/** Traduz mensagens de erro conhecidas da API para um texto amigável em pt-BR. */
function translateCancelError(message: string): string {
  const loyaltyMatch = message.match(
    /loyalty period\. You can cancel in (\d+) day\(s\)\./i,
  );
  if (loyaltyMatch) {
    const days = Number(loyaltyMatch[1]);
    return `Este plano tem um período mínimo de fidelidade. Você poderá cancelar em ${days} dia${days === 1 ? "" : "s"}.`;
  }
  return message;
}

export function useClientSubscription(barbershopId: string | undefined) {
  const [mySubscription, setMySubscription] = useState<MySubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMine = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await clientSubscriptionsService.me(barbershopId);
      setMySubscription(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar sua assinatura.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchMine();
  }, [barbershopId, fetchMine]);

  /**
   * `paymentMethod: "CREDIT_CARD"` (padrão) redireciona pro checkout hospedado
   * pelo gateway e retorna `true` — a assinatura só é criada de fato quando o
   * pagamento for confirmado (webhook). `paymentMethod: "PIX_AUTOMATICO"` NÃO
   * redireciona: retorna o `SubscribePixAuthorizationResult` (com o QR/link de
   * autorização) para a página exibir e fazer polling do status — ver
   * `PlanoClientePage`.
   */
  const subscribe = useCallback(
    async (
      planId: string,
      paymentMethod: SubscriptionPaymentMethod = "CREDIT_CARD",
    ): Promise<boolean | SubscribePixAuthorizationResult> => {
      if (!barbershopId) return false;
      try {
        const result = await clientSubscriptionsService.subscribe(barbershopId, {
          planId,
          paymentMethod,
        });

        if (isPixAuthorizationResult(result)) {
          if (!result.paymentAuthorization.authorizationUrl) {
            toast.error("Não foi possível gerar a autorização Pix Automático.");
            return false;
          }
          return result;
        }

        if (!result.checkoutUrl) {
          toast.error(result.errorMessage ?? "Não foi possível gerar o checkout.");
          return false;
        }
        window.location.href = result.checkoutUrl;
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao assinar o plano.");
        return false;
      }
    },
    [barbershopId],
  );

  const cancel = useCallback(
    async (reason: CancelReasonCode): Promise<PreCancelledClient | false> => {
      if (!barbershopId) return false;
      try {
        const result = await clientSubscriptionsService.cancel(barbershopId, reason);
        toast.success("Cancelamento agendado. Seu plano continua ativo até a data informada.");
        await fetchMine();
        return result;
      } catch (err) {
        toast.error(
          err instanceof Error ? translateCancelError(err.message) : "Falha ao cancelar assinatura.",
        );
        return false;
      }
    },
    [barbershopId, fetchMine],
  );

  return { mySubscription, isLoading, subscribe, cancel, refresh: fetchMine };
}
