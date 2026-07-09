import { api } from "@/lib/api";
import type { Subscription } from "@/types/subscription.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/subscriptions`;

export const subscriptionsService = {
  async list(barbershopId: string): Promise<Subscription[]> {
    const { data } = await api.get<Subscription[]>(base(barbershopId));
    return data;
  },

  async cancel(barbershopId: string, id: string): Promise<void> {
    await api.patch<void>(`${base(barbershopId)}/${id}/cancel`);
  },
};
