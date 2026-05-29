import { api, ApiError } from "@/lib/api";
import type {
  Barbershop,
  UpdateBarbershopPayload,
} from "@/types/barbershop.types";

async function findInList(slug: string): Promise<Barbershop> {
  const { data } = await api.get<Barbershop[]>("/barbershops");
  const found = data.find((b) => b.slug === slug);
  if (!found) throw new ApiError("Barbearia não encontrada.", 404);
  return found;
}

export const barbershopsService = {
  async list(): Promise<Barbershop[]> {
    const { data } = await api.get<Barbershop[]>("/barbershops");
    return data;
  },

  /**
   * Busca pelo slug. Tenta `GET /barbershops/:slug` direto; se o backend ainda
   * estiver protegendo essa rota (401/403), cai pra `GET /barbershops` (pública)
   * e filtra client-side. Isso destrava o fluxo público enquanto o backend não
   * libera o endpoint direto.
   */
  async getBySlug(slug: string): Promise<Barbershop> {
    try {
      const { data } = await api.get<Barbershop>(`/barbershops/${slug}`);
      return data;
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 401 || err.status === 403)
      ) {
        return findInList(slug);
      }
      throw err;
    }
  },

  async update(id: string, payload: UpdateBarbershopPayload): Promise<Barbershop> {
    const { data } = await api.put<Barbershop>(`/barbershops/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${id}`);
  },
};
