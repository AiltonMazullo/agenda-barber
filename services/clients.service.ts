import { api } from "@/lib/api";
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/types/client.types";

export const clientsService = {
  async list(barbershopId: string): Promise<Client[]> {
    const { data } = await api.get<Client[]>(
      `/barbershops/${barbershopId}/clients`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateClientPayload,
  ): Promise<Client> {
    const { data } = await api.post<Client>(
      `/barbershops/${barbershopId}/clients`,
      payload,
    );
    return data;
  },

  async getById(barbershopId: string, id: string): Promise<Client> {
    const { data } = await api.get<Client>(
      `/barbershops/${barbershopId}/clients/${id}`,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateClientPayload,
  ): Promise<Client> {
    const { data } = await api.put<Client>(
      `/barbershops/${barbershopId}/clients/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/clients/${id}`);
  },
};
