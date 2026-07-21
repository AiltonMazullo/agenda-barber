import type { Plan } from "./plan.types";

export interface SubscriptionClient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface SubscriptionPlanSummary {
  id: string;
  name: string;
  priceInCents: number;
  labelColor: string;
}

export type SubscriptionBillingType = "GATEWAY" | "MANUAL";

export interface Subscription {
  id: string;
  clientId: string;
  planId: string;
  barbershopId: string;
  status: "ACTIVE" | "CANCELLED";
  startedAt: string;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  priceOverrideInCents: number | null;
  billingDay: number | null;
  billingType: SubscriptionBillingType;
  soldByEmployeeId: string | null;
  client: SubscriptionClient;
  plan: SubscriptionPlanSummary;
}

export interface SubscriptionCalendar {
  [isoDate: string]: number;
}

export interface BulkUpdateSubscriptionsPayload {
  subscriptionIds: string[];
  newValueInCents?: number;
  applyOnlyNextInvoice?: boolean;
  newBillingDay?: number;
}

export interface BulkUpdateSubscriptionsResult {
  updated: number;
  scope: "next_invoice" | "subscription";
}

export interface SubscriptionContract extends Subscription {
  charges: { id: string; dueDate: string; status: string; amountInCents: number }[];
  contractStatus: "REGULAR" | "ATRASADO";
}

export interface SubscriptionContractsResult {
  contracts: SubscriptionContract[];
  totals: { gateway: number; manual: number; total: number };
}

export interface SubscriptionCharge {
  id: string;
  subscriptionId: string;
  dueDate: string;
  paidAt: string | null;
  amountInCents: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "FAILED";
  gatewayChargeId: string | null;
  createdAt: string;
  updatedAt: string;
  subscription: {
    id: string;
    plan: { id: string; name: string };
  };
}

export interface ServiceUsage {
  serviceId: string;
  monthlyLimit: number;
  used: number;
  remaining: number;
}

export interface MySubscription {
  subscription: Subscription & { plan: Plan };
  usage: ServiceUsage[];
}

export interface SubscribePayload {
  planId: string;
}

/**
 * Resposta de `POST /subscriptions` (self-service) — não é mais a Subscription
 * em si, e sim o registro de pré-aprovado com a sessão de checkout gerada no
 * gateway ativo. A Subscription só é criada quando o webhook confirmar o
 * pagamento (spec-gateways-pagamento.md — checkout externo).
 */
export interface SubscribeCheckoutResult {
  id: string;
  status: "AGUARDANDO" | "ERRO" | "SUCESSO";
  checkoutUrl: string | null;
  errorMessage: string | null;
}
