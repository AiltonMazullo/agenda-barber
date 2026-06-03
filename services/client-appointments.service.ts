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
   * Body: `{ serviceId, scheduledAt, employeeId? }`.
   */
  async create(
    barbershopId: string,
    payload: CreateAppointmentPayload,
  ): Promise<Appointment> {
    const { data } = await clientApi.post<Appointment>(
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
};
