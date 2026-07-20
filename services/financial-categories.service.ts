import { api } from "@/lib/api";
import type {
  CreateFinancialCategoryPayload,
  FinancialCategory,
  FinancialCategoryType,
  UpdateFinancialCategoryPayload,
} from "@/types/financial-category.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/financial-categories`;

export const financialCategoriesService = {
  async list(barbershopId: string, type?: FinancialCategoryType): Promise<FinancialCategory[]> {
    const { data } = await api.get<FinancialCategory[]>(base(barbershopId), { params: { type } });
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateFinancialCategoryPayload,
  ): Promise<FinancialCategory> {
    const { data } = await api.post<FinancialCategory>(base(barbershopId), payload);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateFinancialCategoryPayload,
  ): Promise<FinancialCategory> {
    const { data } = await api.patch<FinancialCategory>(`${base(barbershopId)}/${id}`, payload);
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
