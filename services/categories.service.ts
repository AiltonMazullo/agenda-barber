import { api } from "@/lib/api";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";

export const categoriesService = {
  async list(barbershopId: string): Promise<Category[]> {
    const { data } = await api.get<Category[]>(
      `/barbershops/${barbershopId}/categories`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateCategoryPayload,
  ): Promise<Category> {
    const { data } = await api.post<Category>(
      `/barbershops/${barbershopId}/categories`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateCategoryPayload,
  ): Promise<Category> {
    const { data } = await api.put<Category>(
      `/barbershops/${barbershopId}/categories/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/categories/${id}`);
  },
};
