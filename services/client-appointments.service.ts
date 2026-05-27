import { clientApi } from "@/lib/client-api";
import type {
  Appointment,
  CreateAppointmentPayload,
} from "@/types/appointment.types";

/**
 * Operações de agendamento feitas pelo cliente final (autenticado como Client).
 *
 * O backend usa `req.user.sub` como `clientId` — o front não envia mais o id.
 */
export const clientAppointmentsService = {
  async listMine(barbershopId: string): Promise<Appointment[]> {
    const { data } = await clientApi.get<Appointment[]>(
      `/barbershops/${barbershopId}/appointments/me`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateAppointmentPayload,
  ): Promise<Appointment> {
    const { data } = await clientApi.post<Appointment>(
      `/barbershops/${barbershopId}/appointments`,
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
