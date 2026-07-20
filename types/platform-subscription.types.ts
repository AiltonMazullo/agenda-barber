export type PlatformSubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED";

export interface PlatformSubscriptionCharge {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  paymentDate: string | null;
  billingType: string | null;
  invoiceUrl: string | null;
}

export interface PlatformSubscriptionMe {
  status: PlatformSubscriptionStatus;
  /** Já considera trial vigente / assinatura ativa / cancelamento em período de carência — não recalcular no front. */
  isActive: boolean;
  trialEndsAt: string;
  trialDaysLeft: number;
  price: number;
  nextDueDate: string | null;
  canceledAt: string | null;
  charges: PlatformSubscriptionCharge[];
}

export interface CheckoutResponse {
  checkoutUrl: string;
}
