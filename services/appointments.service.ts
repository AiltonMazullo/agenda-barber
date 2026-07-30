import { api } from "@/lib/api";
import type {
  Appointment,
  CreateAppointmentPayload,
  RescheduleAppointmentPayload,
  TransferAppointmentPayload,
  UpdateAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from "@/types/appointment.types";

export const appointmentsService = {
  async list(barbershopId: string): Promise<Appointment[]> {
    const { data } = await api.get<Appointment[]>(
      `/barbershops/${barbershopId}/appointments`,
    );
    return data;
  },

  /**
   * Cria um agendamento por serviço combo — o backend retorna um
   * `Appointment` por serviço selecionado (todos compartilhando `groupId`
   * quando há mais de um), renderizados como um único card na agenda.
   */
  async create(
    barbershopId: string,
    payload: CreateAppointmentPayload,
  ): Promise<Appointment[]> {
    const { data } = await api.post<Appointment[]>(
      `/barbershops/${barbershopId}/appointments`,
      payload,
    );
    return data;
  },

  async updateStatus(
    barbershopId: string,
    id: string,
    payload: UpdateAppointmentStatusPayload,
  ): Promise<Appointment> {
    const { data } = await api.patch<Appointment>(
      `/barbershops/${barbershopId}/appointments/${id}/status`,
      payload,
    );
    return data;
  },

  async cancel(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/appointments/${id}`);
  },

  /** Persiste o reagendamento (drag-and-drop): novo horário e, opcionalmente, novo profissional. */
  async reschedule(
    barbershopId: string,
    id: string,
    payload: RescheduleAppointmentPayload,
  ): Promise<Appointment> {
    const { data } = await api.patch<Appointment>(
      `/barbershops/${barbershopId}/appointments/${id}/reschedule`,
      payload,
    );
    return data;
  },

  async resize(
    barbershopId: string,
    id: string,
    durationMin: number,
  ): Promise<Appointment> {
    const { data } = await api.patch<Appointment>(
      `/barbershops/${barbershopId}/appointments/${id}/resize`,
      { durationMin },
    );
    return data;
  },

  /** Troca o cliente do agendamento (cascateia pro grupo no backend). */
  async transfer(
    barbershopId: string,
    id: string,
    payload: TransferAppointmentPayload,
  ): Promise<Appointment> {
    const { data } = await api.patch<Appointment>(
      `/barbershops/${barbershopId}/appointments/${id}/transfer`,
      payload,
    );
    return data;
  },

  /**
   * Endpoint unificado usado pelo modal de detalhe (`DialogDetalhe`):
   * serviços, data/horário, filial e profissional num único PATCH.
   */
  async update(
    barbershopId: string,
    id: string,
    payload: UpdateAppointmentPayload,
  ): Promise<Appointment> {
    const { data } = await api.patch<Appointment>(
      `/barbershops/${barbershopId}/appointments/${id}`,
      payload,
    );
    return data;
  },
};
