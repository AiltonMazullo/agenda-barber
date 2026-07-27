import type { Service } from "@/types/service.types";

/**
 * Tipos espelhando o modelo `Appointment` do backend.
 */

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

/** Quem criou o agendamento: o cliente (reserva online) ou a equipe (painel). */
export type AppointmentOrigin = "CLIENT" | "INTERNAL";

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
  origin: AppointmentOrigin;
  clientId: string;
  serviceId: string;
  employeeId: string | null;
  barbershopId: string;
  /** Agrupa agendamentos criados na mesma reserva combo (múltiplos serviços). Null = serviço único. */
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Appointment como vem do `GET /appointments` com client + service populados. */
export interface Appointment extends AppointmentRaw {
  client: AppointmentClient;
  service: Service;
  employee?: AppointmentEmployee | null;
}

/** Barbearia como vem aninhada em `GET /clients/me/appointments`. */
export interface AppointmentBarbershopRef {
  id: string;
  name: string;
  slug: string;
}

/**
 * Agendamento como vem de `GET /clients/me/appointments` (visão do cliente):
 * traz `service` e `barbershop` aninhados, sem o `client` (é o próprio).
 */
export interface ClientAppointment extends AppointmentRaw {
  service: Service;
  barbershop: AppointmentBarbershopRef;
  employee?: AppointmentEmployee | null;
}

export interface CreateAppointmentPayload {
  /**
   * Obrigatório quando o dono cria o agendamento (escolhe o cliente da lista).
   * No fluxo público do cliente é omitido — o backend usa `req.user.sub`.
   */
  clientId?: string;
  /** Um ou mais serviços — a barbearia recebe um único agendamento (card) com a duração somada. */
  serviceIds: string[];
  /** Profissional que vai atender. */
  employeeId?: string;
  /** ISO datetime string (UTC). */
  scheduledAt: string;
}

export type UpdatableAppointmentStatus = Exclude<AppointmentStatus, "PENDING">;

export interface UpdateAppointmentStatusPayload {
  status: UpdatableAppointmentStatus;
}

/** Body de `PATCH /appointments/:id/reschedule` — usado pelo drag-and-drop da agenda. */
export interface RescheduleAppointmentPayload {
  /** ISO datetime string (UTC). */
  scheduledAt: string;
  employeeId?: string;
}
