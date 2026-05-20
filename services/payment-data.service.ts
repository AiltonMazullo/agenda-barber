import { api } from "@/lib/api";
import type {
  CreatePaymentDataPayload,
  PaymentData,
  UpdatePaymentDataPayload,
} from "@/types/payment-data.types";

export const paymentDataService = {
  async get(barbershopId: string): Promise<PaymentData | null> {
    try {
      const { data } = await api.get<PaymentData>(
        `/barbershops/${barbershopId}/payment-data`,
      );
      return data;
    } catch {
      return null;
    }
  },

  async create(
    barbershopId: string,
    payload: CreatePaymentDataPayload,
  ): Promise<PaymentData> {
    const { data } = await api.post<PaymentData>(
      `/barbershops/${barbershopId}/payment-data`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    payload: UpdatePaymentDataPayload,
  ): Promise<PaymentData> {
    const { data } = await api.put<PaymentData>(
      `/barbershops/${barbershopId}/payment-data`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/payment-data`);
  },
};
