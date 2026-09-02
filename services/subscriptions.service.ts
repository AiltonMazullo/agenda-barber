import { api } from "@/lib/api";
import type {
  BulkUpdateSubscriptionsPayload,
  BulkUpdateSubscriptionsResult,
  ProductPricing,
  ServicePricing,
  Subscription,
  SubscriptionBillingType,
  SubscriptionCalendar,
  SubscriptionCharge,
  SubscriptionContractsResult,
  SubscriptionPaymentMethod,
} from "@/types/subscription.types";
import type { CancelReasonCode } from "@/types/pre-cancelled-client.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/subscriptions`;

export const subscriptionsService = {
  async list(barbershopId: string): Promise<Subscription[]> {
    const { data } = await api.get<Subscription[]>(base(barbershopId));
    return data;
  },

  /**
   * Recepção/dono cria a assinatura em nome de um cliente já cadastrado.
   * Para `CREDIT_CARD` a `Subscription` só é criada quando o gateway
   * confirma o pagamento (webhook) — a resposta aqui é o registro de
   * pré-aprovação com `checkoutUrl`, não uma `Subscription` ainda utilizável
   * (spec-revisao-cliente-4.md §5.1). Pix Automático/avulso já retornam a
   * `Subscription` de verdade.
   */
  async createManual(
    barbershopId: string,
    payload: { clientId: string; planId: string; paymentMethod?: SubscriptionPaymentMethod },
  ): Promise<Subscription | { checkoutUrl: string }> {
    const { data } = await api.post<Subscription | { checkoutUrl: string }>(
      `${base(barbershopId)}/manual`,
      payload,
    );
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

  /**
   * Preço efetivo (grátis ou com desconto) de um serviço para um cliente
   * assinante. `referenceDate` (data do agendamento) determina se o dia cai
   * dentro de `Plan.availableWeekdays` — fora dele, o backend ignora o
   * "serviço incluso" específico e aplica o desconto por categoria, se houver.
   */
  async getServicePricing(
    barbershopId: string,
    clientId: string,
    serviceId: string,
    referenceDate?: string,
  ): Promise<ServicePricing> {
    const { data } = await api.get<ServicePricing>(
      `${base(barbershopId)}/clients/${clientId}/service-pricing/${serviceId}`,
      { params: { referenceDate } },
    );
    return data;
  },

  /** Preço efetivo (preço fixo do plano ou desconto de categoria) de um produto para um cliente assinante. */
  async getProductPricing(
    barbershopId: string,
    clientId: string,
    productId: string,
    referenceDate?: string,
  ): Promise<ProductPricing> {
    const { data } = await api.get<ProductPricing>(
      `${base(barbershopId)}/clients/${clientId}/product-pricing/${productId}`,
      { params: { referenceDate } },
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
