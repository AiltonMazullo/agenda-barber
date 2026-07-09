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
  client: SubscriptionClient;
  plan: SubscriptionPlanSummary;
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
