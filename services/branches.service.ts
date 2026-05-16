import { api } from "@/lib/api";
import type {
  Branch,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/types/branch.types";

export const branchesService = {
  async list(barbershopId: string): Promise<Branch[]> {
    const { data } = await api.get<Branch[]>(
      `/barbershops/${barbershopId}/branches`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateBranchPayload,
  ): Promise<Branch> {
    const { data } = await api.post<Branch>(
      `/barbershops/${barbershopId}/branches`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateBranchPayload,
  ): Promise<Branch> {
    const { data } = await api.put<Branch>(
      `/barbershops/${barbershopId}/branches/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/branches/${id}`);
  },
};
