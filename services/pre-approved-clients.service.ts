import { api } from "@/lib/api";
import type {
  CreatePreApprovedClientPayload,
  PreApprovalStatus,
  PreApprovedClient,
} from "@/types/pre-approved-client.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/pre-approved-clients`;

export const preApprovedClientsService = {
  async list(barbershopId: string, status?: PreApprovalStatus): Promise<PreApprovedClient[]> {
    const { data } = await api.get<PreApprovedClient[]>(base(barbershopId), {
      params: { status },
    });
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreatePreApprovedClientPayload,
  ): Promise<PreApprovedClient> {
    const { data } = await api.post<PreApprovedClient>(base(barbershopId), payload);
    return data;
  },

  async resendLink(barbershopId: string, id: string): Promise<PreApprovedClient> {
    const { data } = await api.post<PreApprovedClient>(`${base(barbershopId)}/${id}/resend-link`);
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
