/** Tipos espelhando o modelo `ScheduleBlock` (bloqueio de horário) do backend. */

export interface ScheduleBlock {
  id: string;
  barbershopId: string;
  branchId: string;
  /** null = bloqueia todos os profissionais da filial. */
  employeeId: string | null;
  /** ISO datetime — "hora de parede", sem conversão de fuso (mesma convenção de Appointment.scheduledAt). */
  startAt: string;
  endAt: string;
  reason: string;
  createdAt: string;
}

export interface CreateScheduleBlockPayload {
  branchId: string;
  employeeId?: string | null;
  startAt: string;
  endAt: string;
  reason?: string;
}
