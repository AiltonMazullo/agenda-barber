import { api } from "@/lib/api";
import type {
  Plan,
  CreatePlanPayload,
  PlanReorderItem,
  UpdatePlanPayload,
  UpdatePlanStatusPayload,
} from "@/types/plan.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/plans`;

export const plansService = {
  async list(barbershopId: string): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>(base(barbershopId));
    return data;
  },

  async listAdmin(barbershopId: string): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>(`${base(barbershopId)}/admin`);
    return data;
  },

  async getById(barbershopId: string, planId: string): Promise<Plan> {
    const { data } = await api.get<Plan>(`${base(barbershopId)}/${planId}`);
    return data;
  },

  async create(barbershopId: string, payload: CreatePlanPayload): Promise<Plan> {
    const { data } = await api.post<Plan>(base(barbershopId), payload);
    return data;
  },

  async update(barbershopId: string, planId: string, payload: UpdatePlanPayload): Promise<Plan> {
    const { data } = await api.put<Plan>(`${base(barbershopId)}/${planId}`, payload);
    return data;
  },

  async updateStatus(barbershopId: string, planId: string, payload: UpdatePlanStatusPayload): Promise<Plan> {
    const { data } = await api.patch<Plan>(`${base(barbershopId)}/${planId}/status`, payload);
    return data;
  },

  async uploadContract(barbershopId: string, planId: string, file: File): Promise<Plan> {
    const formData = new FormData();
    formData.append("contract", file);
    const { data } = await api.patch<Plan>(
      `${base(barbershopId)}/${planId}/contract`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async addCategory(
    barbershopId: string,
    planId: string,
    payload: { categoryId: string; discountPercent: number },
  ): Promise<Plan> {
    const { data } = await api.post<Plan>(`${base(barbershopId)}/${planId}/categories`, payload);
    return data;
  },

  async removeCategory(barbershopId: string, planId: string, categoryId: string): Promise<Plan> {
    const { data } = await api.delete<Plan>(
      `${base(barbershopId)}/${planId}/categories/${categoryId}`,
    );
    return data;
  },

  async reorder(barbershopId: string, order: PlanReorderItem[]): Promise<Plan[]> {
    const { data } = await api.patch<Plan[]>(`${base(barbershopId)}/reorder`, { order });
    return data;
  },
};
