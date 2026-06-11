import { api } from "@/lib/api";
import type {
  CreateServicePayload,
  Service,
  UpdateServicePayload,
} from "@/types/service.types";

export const servicesService = {
  async list(barbershopId: string): Promise<Service[]> {
    const { data } = await api.get<Service[]>(
      `/barbershops/${barbershopId}/services`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateServicePayload,
  ): Promise<Service> {
    const { data } = await api.post<Service>(
      `/barbershops/${barbershopId}/services`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateServicePayload,
  ): Promise<Service> {
    const { data } = await api.put<Service>(
      `/barbershops/${barbershopId}/services/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/services/${id}`);
  },

  async setFeatured(
    barbershopId: string,
    id: string,
    featured: boolean,
  ): Promise<Service> {
    const { data } = await api.patch<Service>(
      `/barbershops/${barbershopId}/services/${id}/featured`,
      { featured },
    );
    return data;
  },
};
