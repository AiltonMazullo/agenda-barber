import { api } from "@/lib/api";
import type {
  ClientBlock,
  CreateClientBlockPayload,
} from "@/types/client-block.types";

export const clientBlockService = {
  async list(barbershopId: string, clientId?: string): Promise<ClientBlock[]> {
    const { data } = await api.get<ClientBlock[]>(
      `/barbershops/${barbershopId}/client-blocks`,
      { params: clientId ? { clientId } : undefined },
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateClientBlockPayload,
  ): Promise<ClientBlock> {
    const { data } = await api.post<ClientBlock>(
      `/barbershops/${barbershopId}/client-blocks`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/client-blocks/${id}`);
  },
};
