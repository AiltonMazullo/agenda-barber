import { api } from "@/lib/api";
import type {
  CreatePreCancelledClientPayload,
  PreCancelledClient,
  PreCancelledStatus,
} from "@/types/pre-cancelled-client.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/pre-cancelled-clients`;

export const preCancelledClientsService = {
  async list(barbershopId: string, status?: PreCancelledStatus): Promise<PreCancelledClient[]> {
    const { data } = await api.get<PreCancelledClient[]>(base(barbershopId), {
      params: { status },
    });
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreatePreCancelledClientPayload,
  ): Promise<PreCancelledClient> {
    const { data } = await api.post<PreCancelledClient>(base(barbershopId), payload);
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
