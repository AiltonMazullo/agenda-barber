import { api } from "@/lib/api";
import type {
  Plan,
  CreatePlanPayload,
  UpdatePlanPayload,
} from "@/types/plan.types";

/**
 * Planos da barbearia.
 *
 * ⚠️ Stubs — as rotas ainda não existem no backend. Os paths abaixo são uma
 * suposição (`/barbershops/:bid/plans`) e devem ser confirmados/ajustados
 * quando o contrato chegar. Enquanto isso, as telas usam estado placeholder e
 * não chamam estes métodos.
 */
const base = (barbershopId: string) => `/barbershops/${barbershopId}/plans`;

export const plansService = {
  async list(barbershopId: string): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>(base(barbershopId));
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreatePlanPayload,
  ): Promise<Plan> {
    const { data } = await api.post<Plan>(base(barbershopId), payload);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdatePlanPayload,
  ): Promise<Plan> {
    const { data } = await api.put<Plan>(`${base(barbershopId)}/${id}`, payload);
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
