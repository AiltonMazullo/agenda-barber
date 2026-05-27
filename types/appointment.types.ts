import type { Service } from "@/types/service.types";

/**
 * Tipos espelhando o modelo `Appointment` do backend.
 */

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

/** Cliente como vem populado no `GET /appointments` (campos parciais). */
export interface AppointmentClient {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

/** Profissional como vem populado no `GET /appointments` (campos parciais). */
export interface AppointmentEmployee {
  id: string;
  name: string;
  appName: string;
}

/** Appointment crú (sem includes). */
export interface AppointmentRaw {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  clientId: string;
  serviceId: string;
  employeeId: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

/** Appointment como vem do `GET /appointments` com client + service populados. */
export interface Appointment extends AppointmentRaw {
  client: AppointmentClient;
  service: Service;
  employee?: AppointmentEmployee | null;
}

export interface CreateAppointmentPayload {
  /**
   * Obrigatório quando o dono cria o agendamento (escolhe o cliente da lista).
   * No fluxo público do cliente é omitido — o backend usa `req.user.sub`.
   */
  clientId?: string;
  serviceId: string;
  /** Profissional que vai atender. */
  employeeId?: string;
  /** ISO datetime string (UTC). */
  scheduledAt: string;
}

export type UpdatableAppointmentStatus = Exclude<AppointmentStatus, "PENDING">;

export interface UpdateAppointmentStatusPayload {
  status: UpdatableAppointmentStatus;
}
