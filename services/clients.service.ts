import { api } from "@/lib/api";
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/types/client.types";
import type { AppointmentWithProducts } from "@/types/appointment.types";

export interface ClientImportResult {
  total: number;
  created: number;
  skipped: number;
  errors: { line: number; email: string; reason: string }[];
}

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

  /** Importação em massa via CSV (spec-revisao-cliente-4.md §6.3). */
  async importCsv(
    barbershopId: string,
    file: File,
  ): Promise<ClientImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ClientImportResult>(
      `/barbershops/${barbershopId}/clients/import`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async updateNotes(
    barbershopId: string,
    id: string,
    notes: string | null,
  ): Promise<Client> {
    const { data } = await api.patch<Client>(
      `/barbershops/${barbershopId}/clients/${id}/notes`,
      { notes },
    );
    return data;
  },

  /** Últimos agendamentos do cliente na barbearia (mais recentes primeiro). */
  async getRecentAppointments(
    barbershopId: string,
    id: string,
    limit = 3,
  ): Promise<AppointmentWithProducts[]> {
    const { data } = await api.get<AppointmentWithProducts[]>(
      `/barbershops/${barbershopId}/clients/${id}/appointments`,
      { params: { limit } },
    );
    return data;
  },

  /** Envia a foto do cliente (campo `photo`, JPEG/PNG/WebP até 2MB). */
  async uploadPhoto(
    barbershopId: string,
    id: string,
    file: File,
  ): Promise<Client> {
    const formData = new FormData();
    formData.append("photo", file);
    const { data } = await api.patch<Client>(
      `/barbershops/${barbershopId}/clients/${id}/photo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },
};
