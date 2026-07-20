import { api } from "@/lib/api";
import type {
  BranchConfigInput,
  CreatePaymentMethodPayload,
  PaymentMethodConfig,
  UpdatePaymentMethodPayload,
} from "@/types/payment-method.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/payment-methods`;

export const paymentMethodsService = {
  async list(barbershopId: string): Promise<PaymentMethodConfig[]> {
    const { data } = await api.get<PaymentMethodConfig[]>(base(barbershopId));
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreatePaymentMethodPayload,
  ): Promise<PaymentMethodConfig> {
    const { data } = await api.post<PaymentMethodConfig>(base(barbershopId), payload);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdatePaymentMethodPayload,
  ): Promise<PaymentMethodConfig> {
    const { data } = await api.patch<PaymentMethodConfig>(`${base(barbershopId)}/${id}`, payload);
    return data;
  },

  async updateBranchConfigs(
    barbershopId: string,
    id: string,
    configs: BranchConfigInput[],
  ): Promise<PaymentMethodConfig> {
    const { data } = await api.put<PaymentMethodConfig>(`${base(barbershopId)}/${id}/branches`, {
      configs,
    });
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
