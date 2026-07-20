import { api } from "@/lib/api";
import type {
  CheckoutResponse,
  PlatformSubscriptionMe,
} from "@/types/platform-subscription.types";

export const platformSubscriptionService = {
  async me(): Promise<PlatformSubscriptionMe> {
    const { data } = await api.get<PlatformSubscriptionMe>(
      "/platform-subscription/me",
    );
    return data;
  },

  async checkout(): Promise<CheckoutResponse> {
    const { data } = await api.post<CheckoutResponse>(
      "/platform-subscription/checkout",
    );
    return data;
  },

  async cancel(): Promise<void> {
    await api.post("/platform-subscription/cancel");
  },
};
