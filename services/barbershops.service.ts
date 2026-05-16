import { api } from "@/lib/api";
import type {
  Barbershop,
  UpdateBarbershopPayload,
} from "@/types/barbershop.types";

export const barbershopsService = {
  async list(): Promise<Barbershop[]> {
    const { data } = await api.get<Barbershop[]>("/barbershops");
    return data;
  },

  async getBySlug(slug: string): Promise<Barbershop> {
    const { data } = await api.get<Barbershop>(`/barbershops/${slug}`);
    return data;
  },

  async update(id: string, payload: UpdateBarbershopPayload): Promise<Barbershop> {
    const { data } = await api.put<Barbershop>(`/barbershops/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${id}`);
  },
};
