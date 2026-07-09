import { clientApi } from "@/lib/client-api";
import type { MySubscription, SubscribePayload, Subscription } from "@/types/subscription.types";

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

  async subscribe(barbershopId: string, payload: SubscribePayload): Promise<Subscription> {
    const { data } = await clientApi.post<Subscription>(base(barbershopId), payload);
    return data;
  },

  async cancel(barbershopId: string): Promise<void> {
    await clientApi.patch<void>(`${base(barbershopId)}/me/cancel`);
  },
};
