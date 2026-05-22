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
}

/** Appointment crú (sem includes). */
export interface AppointmentRaw {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  clientId: string;
  serviceId: string;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

/** Appointment como vem do `GET /appointments` com client + service populados. */
export interface Appointment extends AppointmentRaw {
  client: AppointmentClient;
  service: Service;
}

export interface CreateAppointmentPayload {
  /**
   * Conforme ROTAS.md, apenas `serviceId` e `scheduledAt` são obrigatórios.
   * O backend pode exigir `clientId` adicionalmente (Prisma NOT NULL) —
   * enviar opcionalmente quando disponível.
   */
  clientId?: string;
  serviceId: string;
  /** ISO datetime string (UTC). */
  scheduledAt: string;
}

export type UpdatableAppointmentStatus = Exclude<AppointmentStatus, "PENDING">;

export interface UpdateAppointmentStatusPayload {
  status: UpdatableAppointmentStatus;
}
