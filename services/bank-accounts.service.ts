import { api } from "@/lib/api";
import type {
  BankAccount,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
} from "@/types/bank-account.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/bank-accounts`;

export const bankAccountsService = {
  async list(barbershopId: string): Promise<BankAccount[]> {
    const { data } = await api.get<BankAccount[]>(base(barbershopId));
    return data;
  },

  async create(barbershopId: string, payload: CreateBankAccountPayload): Promise<BankAccount> {
    const { data } = await api.post<BankAccount>(base(barbershopId), payload);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateBankAccountPayload,
  ): Promise<BankAccount> {
    const { data } = await api.patch<BankAccount>(`${base(barbershopId)}/${id}`, payload);
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
