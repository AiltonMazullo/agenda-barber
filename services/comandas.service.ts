import { api } from "@/lib/api";
import type { Comanda, ComandaDraft, ComandaStatus } from "@/types/orders.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/comandas`;

export const comandasService = {
  async list(
    barbershopId: string,
    filters: { clientId?: string } = {},
  ): Promise<Comanda[]> {
    const { data } = await api.get<Comanda[]>(base(barbershopId), {
      params: filters,
    });
    return data;
  },

  async getById(barbershopId: string, id: string): Promise<Comanda> {
    const { data } = await api.get<Comanda>(`${base(barbershopId)}/${id}`);
    return data;
  },

  async create(barbershopId: string, draft: ComandaDraft): Promise<Comanda> {
    const { data } = await api.post<Comanda>(base(barbershopId), draft);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    draft: ComandaDraft,
  ): Promise<Comanda> {
    const { data } = await api.put<Comanda>(`${base(barbershopId)}/${id}`, draft);
    return data;
  },

  async setStatus(
    barbershopId: string,
    id: string,
    status: ComandaStatus,
  ): Promise<Comanda> {
    const { data } = await api.patch<Comanda>(
      `${base(barbershopId)}/${id}/status`,
      { status },
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete(`${base(barbershopId)}/${id}`);
  },
};
