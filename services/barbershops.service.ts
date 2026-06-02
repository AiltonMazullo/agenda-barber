import { api, ApiError } from "@/lib/api";
import { clientApi, getClientAccessToken } from "@/lib/client-api";
import type {
  Barbershop,
  UpdateBarbershopPayload,
} from "@/types/barbershop.types";

/**
 * As rotas `GET /barbershops` e `GET /barbershops/:slug` exigem token. Usa o
 * token do **cliente** quando há sessão de cliente (fluxo público/cliente);
 * senão usa a instância do **dono** (`api`, que injeta o token do dono se
 * houver). Assim ambos os contextos autenticados funcionam.
 */
function reader() {
  return getClientAccessToken() ? clientApi : api;
}

async function findInList(slug: string): Promise<Barbershop> {
  const { data } = await reader().get<Barbershop[]>("/barbershops");
  const found = data.find((b) => b.slug === slug);
  if (!found) throw new ApiError("Barbearia não encontrada.", 404);
  return found;
}

export const barbershopsService = {
  async list(): Promise<Barbershop[]> {
    const { data } = await reader().get<Barbershop[]>("/barbershops");
    return data;
  },

  /**
   * Busca pelo slug. Tenta `GET /barbershops/:slug` direto; se falhar com
   * 401/403/404, cai pra `GET /barbershops` filtrando pelo slug.
   */
  async getBySlug(slug: string): Promise<Barbershop> {
    try {
      const { data } = await reader().get<Barbershop>(`/barbershops/${slug}`);
      return data;
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 401 || err.status === 403 || err.status === 404)
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
