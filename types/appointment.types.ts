/**
 * Tipos espelhando o modelo `Appointment` do backend.
 */

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface Appointment {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  clientId: string;
  serviceId: string;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  clientId: string;
  serviceId: string;
  /** ISO datetime string (UTC). */
  scheduledAt: string;
}

export type UpdatableAppointmentStatus = Exclude<AppointmentStatus, "PENDING">;

export interface UpdateAppointmentStatusPayload {
  status: UpdatableAppointmentStatus;
}
