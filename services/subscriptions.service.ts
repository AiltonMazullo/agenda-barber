import { api } from "@/lib/api";
import type {
  BulkUpdateSubscriptionsPayload,
  BulkUpdateSubscriptionsResult,
  ServicePricing,
  Subscription,
  SubscriptionBillingType,
  SubscriptionCalendar,
  SubscriptionCharge,
  SubscriptionContractsResult,
} from "@/types/subscription.types";
import type { CancelReasonCode } from "@/types/pre-cancelled-client.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/subscriptions`;

export const subscriptionsService = {
  async list(barbershopId: string): Promise<Subscription[]> {
    const { data } = await api.get<Subscription[]>(base(barbershopId));
    return data;
  },

  /** Recepção/dono cria a assinatura em nome de um cliente já cadastrado. */
  async createManual(
    barbershopId: string,
    payload: { clientId: string; planId: string; paymentMethod?: "CREDIT_CARD" | "PIX_AUTOMATICO" },
  ): Promise<Subscription> {
    const { data } = await api.post<Subscription>(`${base(barbershopId)}/manual`, payload);
    return data;
  },

  async cancel(
    barbershopId: string,
    id: string,
    reason?: CancelReasonCode,
  ): Promise<void> {
    await api.patch<void>(`${base(barbershopId)}/${id}/cancel`, reason ? { reason } : {});
  },

  /** Histórico de cobranças (`SubscriptionCharge`) da assinatura de um cliente. */
  async getClientCharges(
    barbershopId: string,
    clientId: string,
  ): Promise<SubscriptionCharge[]> {
    const { data } = await api.get<SubscriptionCharge[]>(
      `${base(barbershopId)}/clients/${clientId}/charges`,
    );
    return data;
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

  /** Preço efetivo (grátis ou com desconto) de um serviço para um cliente assinante. */
  async getServicePricing(
    barbershopId: string,
    clientId: string,
    serviceId: string,
  ): Promise<ServicePricing> {
    const { data } = await api.get<ServicePricing>(
      `${base(barbershopId)}/clients/${clientId}/service-pricing/${serviceId}`,
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
