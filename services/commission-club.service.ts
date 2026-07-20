import { api } from "@/lib/api";
import type {
  CommissionClubRun,
  CommissionRunDistributeResult,
  CommissionRunReport,
  CreateCommissionRunPayload,
  UpdateCommissionRunPayload,
} from "@/types/commission-club.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/commission-club/runs`;

export const commissionClubService = {
  async list(barbershopId: string, branchId?: string): Promise<CommissionClubRun[]> {
    const { data } = await api.get<CommissionClubRun[]>(base(barbershopId), {
      params: { branchId },
    });
    return data;
  },

  async getById(barbershopId: string, id: string): Promise<CommissionClubRun> {
    const { data } = await api.get<CommissionClubRun>(`${base(barbershopId)}/${id}`);
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateCommissionRunPayload,
  ): Promise<CommissionClubRun> {
    const { data } = await api.post<CommissionClubRun>(base(barbershopId), payload);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateCommissionRunPayload,
  ): Promise<CommissionClubRun> {
    const { data } = await api.patch<CommissionClubRun>(`${base(barbershopId)}/${id}`, payload);
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },

  async getReport(barbershopId: string, id: string): Promise<CommissionRunReport> {
    const { data } = await api.get<CommissionRunReport>(`${base(barbershopId)}/${id}/report`);
    return data;
  },

  async distribute(barbershopId: string, id: string): Promise<CommissionRunDistributeResult> {
    const { data } = await api.post<CommissionRunDistributeResult>(
      `${base(barbershopId)}/${id}/distribute`,
    );
    return data;
  },
};
