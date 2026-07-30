export type PlatformSubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED";

export type PlatformPaymentMethod = "CREDIT_CARD" | "PIX";

export interface PixQrCode {
  payload: string;
  encodedImage: string | null;
  expirationDate: string | null;
}

export interface PlatformSubscriptionCharge {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  paymentDate: string | null;
  billingType: string | null;
  invoiceUrl: string | null;
}

export interface BillingProfile {
  phone: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  uf: string;
  complete: boolean;
}

export type BillingProfilePayload = Omit<BillingProfile, "complete">;

export interface PlatformSubscriptionMe {
  status: PlatformSubscriptionStatus;
  /** Já considera trial vigente / assinatura ativa / cancelamento em período de carência — não recalcular no front. */
  isActive: boolean;
  trialEndsAt: string;
  trialDaysLeft: number;
  price: number;
  nextDueDate: string | null;
  canceledAt: string | null;
  paymentMethod: PlatformPaymentMethod;
  billingProfile: BillingProfile;
  charges: PlatformSubscriptionCharge[];
}

export interface CheckoutResponse {
  paymentMethod: PlatformPaymentMethod;
  checkoutUrl: string | null;
  pixQrCode: PixQrCode | null;
}

export interface ChangePaymentMethodResponse {
  paymentMethod: PlatformPaymentMethod;
  pixQrCode: PixQrCode | null;
}
