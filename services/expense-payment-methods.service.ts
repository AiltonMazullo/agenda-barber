import { api } from "@/lib/api";
import type {
  CreateExpensePaymentMethodPayload,
  ExpensePaymentMethod,
  UpdateExpensePaymentMethodPayload,
} from "@/types/expense-payment-method.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/expense-payment-methods`;

export const expensePaymentMethodsService = {
  async list(barbershopId: string): Promise<ExpensePaymentMethod[]> {
    const { data } = await api.get<ExpensePaymentMethod[]>(base(barbershopId));
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateExpensePaymentMethodPayload,
  ): Promise<ExpensePaymentMethod> {
    const { data } = await api.post<ExpensePaymentMethod>(base(barbershopId), payload);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateExpensePaymentMethodPayload,
  ): Promise<ExpensePaymentMethod> {
    const { data } = await api.patch<ExpensePaymentMethod>(`${base(barbershopId)}/${id}`, payload);
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
