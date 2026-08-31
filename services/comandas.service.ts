import { api } from "@/lib/api";
import type { Comanda, ComandaDraft, ComandaStatus } from "@/types/orders.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/comandas`;

export const comandasService = {
  // Backend responde `{ data, total }` (spec-ajustes-escopo-2 §2.4) — sem
  // `page`/`pageSize` no filtro, `total` vem `null` e `data` é a lista
  // inteira (compat com consumidores que não paginam).
  async list(
    barbershopId: string,
    filters: {
      clientId?: string;
      dateFrom?: string;
      dateTo?: string;
      status?: ComandaStatus;
      search?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<{ data: Comanda[]; total: number | null }> {
    const { data } = await api.get<{ data: Comanda[]; total: number | null }>(
      base(barbershopId),
      { params: filters },
    );
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
    pagamentos?: { cashRegisterId: string; paymentMethodId: string; valorInCents: number }[],
  ): Promise<Comanda> {
    const { data } = await api.patch<Comanda>(
      `${base(barbershopId)}/${id}/status`,
      { status, pagamentos },
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete(`${base(barbershopId)}/${id}`);
  },
};
