import { clientApi } from "@/lib/client-api";
import type {
  Appointment,
  ClientAppointment,
  CreateAppointmentPayload,
} from "@/types/appointment.types";

/**
 * Operações de agendamento feitas pelo cliente final (autenticado como Client).
 *
 * Todas usam `clientApi` → o token do cliente vai no header `Authorization`.
 * O `clientId` vem do token (`req.user.sub`), nunca do body.
 */
export const clientAppointmentsService = {
  /**
   * Lista os agendamentos do próprio cliente via `GET /clients/me/appointments`.
   * Retorna `service` e `barbershop` aninhados, ordenados por `scheduledAt`.
   */
  async listMine(): Promise<ClientAppointment[]> {
    const { data } = await clientApi.get<ClientAppointment[]>(
      "/clients/me/appointments",
    );
    return data;
  },

  /**
   * Cria um agendamento pelo fluxo do cliente via
   * `POST /barbershops/:id/appointments/book` (rota dedicada com
   * `clientAuthMiddleware`). O backend usa `req.user.sub` como cliente.
   * Body: `{ serviceIds, scheduledAt, employeeId? }` — um único agendamento
   * (card) é criado com a duração somada de todos os serviços.
   */
  async create(
    barbershopId: string,
    payload: CreateAppointmentPayload,
  ): Promise<Appointment[]> {
    const { data } = await clientApi.post<Appointment[]>(
      `/barbershops/${barbershopId}/appointments/book`,
      payload,
    );
    return data;
  },

  async cancel(barbershopId: string, id: string): Promise<void> {
    await clientApi.delete<void>(
      `/barbershops/${barbershopId}/appointments/${id}`,
    );
  },

  /** Remarca um agendamento existente do próprio cliente (mesmo profissional/serviço). */
  async reschedule(
    barbershopId: string,
    id: string,
    scheduledAt: string,
  ): Promise<Appointment> {
    const { data } = await clientApi.patch<Appointment>(
      `/barbershops/${barbershopId}/appointments/${id}/reschedule-client`,
      { scheduledAt },
    );
    return data;
  },
};
