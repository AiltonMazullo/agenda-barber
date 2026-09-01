import { clientApi } from "@/lib/client-api";
import type {
  MySubscription,
  SubscribePayload,
  SubscribeResult,
} from "@/types/subscription.types";
import type { CancelReasonCode, PreCancelledClient } from "@/types/pre-cancelled-client.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/subscriptions`;

/**
 * Assinatura do próprio cliente final (autenticado como Client). O `clientId`
 * vem do token (`req.user.sub`), nunca do body.
 */
export const clientSubscriptionsService = {
  async me(barbershopId: string): Promise<MySubscription | null> {
    const { data } = await clientApi.get<MySubscription | null>(`${base(barbershopId)}/me`);
    return data;
  },

  /** `payload.paymentMethod` decide o formato da resposta — ver `SubscribeResult`. */
  async subscribe(barbershopId: string, payload: SubscribePayload): Promise<SubscribeResult> {
    const { data } = await clientApi.post<SubscribeResult>(base(barbershopId), payload);
    return data;
  },

  /**
   * Não cancela na hora — agenda o fim da assinatura pro fim do ciclo já
   * pago (`PreCancelledClient`, ver spec-ajustes-escopo-4.md §7). O plano
   * continua utilizável até `cancelDate` na resposta.
   */
  async cancel(barbershopId: string, reason: CancelReasonCode): Promise<PreCancelledClient> {
    const { data } = await clientApi.patch<PreCancelledClient>(
      `${base(barbershopId)}/me/cancel`,
      { reason },
    );
    return data;
  },
};
