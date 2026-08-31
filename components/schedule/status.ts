import type { AppointmentStatus } from "@/types/appointment.types";

/**
 * Cores e rótulos de situação do agendamento na agenda.
 *
 * O backend expõe 7 status: PENDING/CONFIRMED/ARRIVED/IN_PROGRESS/COMPLETED/
 * CANCELLED/NO_SHOW (spec-ajustes-escopo-1.md §2.4/§2.5 — ARRIVED e
 * IN_PROGRESS deixaram de ser só referência visual da legenda).
 */

export const STATUS_COR: Record<AppointmentStatus, string> = {
  PENDING: "#3b82f6", // azul — Agendado
  CONFIRMED: "#22c55e", // verde — Confirmado
  ARRIVED: "#f97316", // laranja — Chegou
  IN_PROGRESS: "#eab308", // amarelo — Em andamento
  COMPLETED: "#6b7280", // cinza — Finalizado
  CANCELLED: "#7f1d1d", // vermelho fraco — Cancelado
  NO_SHOW: "#ec4899", // rosa — Faltou
};

export const STATUS_ROTULO: Record<AppointmentStatus, string> = {
  PENDING: "Agendado",
  CONFIRMED: "Confirmado",
  ARRIVED: "Chegou",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Faltou",
};

/** Legenda completa de cores, derivada de `STATUS_ROTULO`/`STATUS_COR`. */
export const STATUS_LEGENDA: { label: string; cor: string }[] = (
  Object.keys(STATUS_ROTULO) as AppointmentStatus[]
).map((status) => ({ label: STATUS_ROTULO[status], cor: STATUS_COR[status] }));
