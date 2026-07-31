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

export type SubscriptionPaymentMethod = "CREDIT_CARD" | "PIX_AUTOMATICO";

export type PaymentAuthorizationStatus = "PENDING" | "AUTHORIZED" | "CANCELLED";

/** Autorização de consentimento de Pix Automático — 1:1 com a Subscription. */
export interface PaymentAuthorization {
  id: string;
  status: PaymentAuthorizationStatus;
  authorizationUrl: string | null;
  authorizedAt: string | null;
  cancelledAt: string | null;
}

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
  paymentMethod: SubscriptionPaymentMethod;
  paymentAuthorization?: PaymentAuthorization | null;
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
  free: boolean;
  priceInCents: number;
}

export type ServicePricing =
  | { covered: false }
  | { covered: true; free: true; priceInCents: 0 }
  | { covered: true; free: false; priceInCents: number; discountPercent: number };

export interface MySubscription {
  subscription: Subscription & { plan: Plan };
  usage: ServiceUsage[];
  /** Assinatura Pix Automático criada mas ainda aguardando o cliente autorizar no app do banco — sem benefícios de plano ainda. */
  pendingAuthorization?: boolean;
}

export interface SubscribePayload {
  planId: string;
  paymentMethod?: SubscriptionPaymentMethod;
}

/**
 * Resposta de `POST /subscriptions` para `paymentMethod: "CREDIT_CARD"` — não
 * é a Subscription em si, e sim o registro de pré-aprovado com a sessão de
 * checkout gerada no gateway ativo. A Subscription só é criada quando o
 * webhook confirmar o pagamento (spec-gateways-pagamento.md — checkout externo).
 */
export interface SubscribeCheckoutResult {
  id: string;
  status: "AGUARDANDO" | "ERRO" | "SUCESSO";
  checkoutUrl: string | null;
  errorMessage: string | null;
  /** Link do contrato do plano (`Plan.contractUrl`), quando cadastrado. */
  plan?: { contractUrl: string | null } | null;
}

/** Resposta de `POST /subscriptions` para `paymentMethod: "PIX_AUTOMATICO"`. */
export interface SubscribePixAuthorizationResult {
  subscription: Subscription;
  paymentAuthorization: PaymentAuthorization;
}

export type SubscribeResult = SubscribeCheckoutResult | SubscribePixAuthorizationResult;

export function isPixAuthorizationResult(
  result: SubscribeResult,
): result is SubscribePixAuthorizationResult {
  return (result as SubscribePixAuthorizationResult).paymentAuthorization !== undefined;
}
