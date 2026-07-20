import { api } from "@/lib/api";
import type {
  BulkUpdateSubscriptionsPayload,
  BulkUpdateSubscriptionsResult,
  Subscription,
  SubscriptionBillingType,
  SubscriptionCalendar,
  SubscriptionContractsResult,
} from "@/types/subscription.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/subscriptions`;

export const subscriptionsService = {
  async list(barbershopId: string): Promise<Subscription[]> {
    const { data } = await api.get<Subscription[]>(base(barbershopId));
    return data;
  },

  async cancel(barbershopId: string, id: string): Promise<void> {
    await api.patch<void>(`${base(barbershopId)}/${id}/cancel`);
  },

  async getCalendar(
    barbershopId: string,
    month: number,
    year: number,
    type?: SubscriptionBillingType,
  ): Promise<SubscriptionCalendar> {
    const { data } = await api.get<SubscriptionCalendar>(`${base(barbershopId)}/calendar`, {
      params: { month, year, type },
    });
    return data;
  },

  async bulkUpdate(
    barbershopId: string,
    payload: BulkUpdateSubscriptionsPayload,
  ): Promise<BulkUpdateSubscriptionsResult> {
    const { data } = await api.patch<BulkUpdateSubscriptionsResult>(
      `${base(barbershopId)}/bulk`,
      payload,
    );
    return data;
  },

  async getContracts(
    barbershopId: string,
    filters: { billingType?: SubscriptionBillingType; planId?: string; status?: string } = {},
  ): Promise<SubscriptionContractsResult> {
    const { data } = await api.get<SubscriptionContractsResult>(
      `${base(barbershopId)}/contracts`,
      { params: filters },
    );
    return data;
  },
};
