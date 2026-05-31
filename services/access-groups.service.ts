import { api } from "@/lib/api";
import type {
  AccessGroup,
  CreateAccessGroupPayload,
  UpdateAccessGroupPayload,
} from "@/types/access-group.types";

const base = (barbershopId: string) =>
  `/barbershops/${barbershopId}/access-groups`;

export const accessGroupsService = {
  async list(barbershopId: string): Promise<AccessGroup[]> {
    const { data } = await api.get<AccessGroup[]>(base(barbershopId));
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateAccessGroupPayload,
  ): Promise<AccessGroup> {
    const { data } = await api.post<AccessGroup>(base(barbershopId), payload);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateAccessGroupPayload,
  ): Promise<AccessGroup> {
    const { data } = await api.put<AccessGroup>(
      `${base(barbershopId)}/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
