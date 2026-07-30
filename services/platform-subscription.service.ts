import { api } from "@/lib/api";
import type {
  BillingProfile,
  BillingProfilePayload,
  ChangePaymentMethodResponse,
  CheckoutResponse,
  PlatformPaymentMethod,
  PlatformSubscriptionMe,
} from "@/types/platform-subscription.types";

export const platformSubscriptionService = {
  async me(): Promise<PlatformSubscriptionMe> {
    const { data } = await api.get<PlatformSubscriptionMe>(
      "/platform-subscription/me",
    );
    return data;
  },

  async updateBillingProfile(
    payload: BillingProfilePayload,
  ): Promise<BillingProfile> {
    const { data } = await api.put<BillingProfile>(
      "/platform-subscription/billing-profile",
      payload,
    );
    return data;
  },

  async checkout(
    paymentMethod: PlatformPaymentMethod = "CREDIT_CARD",
  ): Promise<CheckoutResponse> {
    const { data } = await api.post<CheckoutResponse>(
      "/platform-subscription/checkout",
      { paymentMethod },
    );
    return data;
  },

  async changePaymentMethod(
    paymentMethod: PlatformPaymentMethod,
  ): Promise<ChangePaymentMethodResponse> {
    const { data } = await api.put<ChangePaymentMethodResponse>(
      "/platform-subscription/payment-method",
      { paymentMethod },
    );
    return data;
  },

  async cancel(): Promise<void> {
    await api.post("/platform-subscription/cancel");
  },
};
