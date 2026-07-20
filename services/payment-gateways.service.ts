import { api } from "@/lib/api";
import type {
  CreatePaymentGatewayPayload,
  GatewayProvider,
  PaymentGatewayConfig,
  TestConnectionResult,
  UpdatePaymentGatewayPayload,
} from "@/types/payment-gateways.types";

export const paymentGatewaysService = {
  async list(barbershopId: string): Promise<PaymentGatewayConfig[]> {
    const { data } = await api.get<PaymentGatewayConfig[]>(
      `/barbershops/${barbershopId}/payment-gateways`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreatePaymentGatewayPayload,
  ): Promise<PaymentGatewayConfig> {
    const { data } = await api.post<PaymentGatewayConfig>(
      `/barbershops/${barbershopId}/payment-gateways`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    provider: GatewayProvider,
    payload: UpdatePaymentGatewayPayload,
  ): Promise<PaymentGatewayConfig> {
    const { data } = await api.patch<PaymentGatewayConfig>(
      `/barbershops/${barbershopId}/payment-gateways/${provider}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, provider: GatewayProvider): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/payment-gateways/${provider}`);
  },

  async activate(
    barbershopId: string,
    provider: GatewayProvider,
  ): Promise<PaymentGatewayConfig> {
    const { data } = await api.patch<PaymentGatewayConfig>(
      `/barbershops/${barbershopId}/payment-gateways/${provider}/activate`,
    );
    return data;
  },

  async test(
    barbershopId: string,
    provider: GatewayProvider,
  ): Promise<TestConnectionResult> {
    const { data } = await api.post<TestConnectionResult>(
      `/barbershops/${barbershopId}/payment-gateways/${provider}/test`,
    );
    return data;
  },
};
