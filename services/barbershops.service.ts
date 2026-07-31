import { api, ApiError, getAccessToken } from "@/lib/api";
import { clientApi, getClientAccessToken } from "@/lib/client-api";
import type {
  Barbershop,
  UpdateBarbershopPayload,
} from "@/types/barbershop.types";

async function multipartPatch<T>(path: string, form: FormData): Promise<T> {
  const token = getAccessToken();
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ""}${path}`,
    {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    },
  );
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({})) as { message?: string };
    throw new ApiError(body?.message ?? "Erro no servidor.", resp.status);
  }
  return resp.json() as Promise<T>;
}

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

export interface ListBarbershopsParams {
  q?: string;
  city?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export const barbershopsService = {
  async list(params?: ListBarbershopsParams): Promise<Barbershop[]> {
    const { data } = await reader().get<Barbershop[]>("/barbershops", { params });
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

  async uploadLogo(id: string, file: File): Promise<Barbershop> {
    const form = new FormData();
    form.append("logo", file);
    return multipartPatch<Barbershop>(`/barbershops/${id}/logo`, form);
  },

  async addCarouselImages(id: string, files: File[]): Promise<Barbershop> {
    const form = new FormData();
    files.forEach((f) => form.append("images[]", f));
    return multipartPatch<Barbershop>(`/barbershops/${id}/carousel`, form);
  },

  async removeCarouselImage(id: string, imageIndex: number): Promise<Barbershop> {
    const { data } = await api.delete<Barbershop>(`/barbershops/${id}/carousel/${imageIndex}`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${id}`);
  },
};
