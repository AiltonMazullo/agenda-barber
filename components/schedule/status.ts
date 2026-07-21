import type { AppointmentStatus } from "@/types/appointment.types";

/**
 * Cores e rótulos de situação do agendamento na agenda.
 *
 * O backend hoje expõe 5 status (PENDING/CONFIRMED/COMPLETED/CANCELLED/NO_SHOW).
 * A legenda visual lista mais duas situações previstas pelo PRD (Chegou, Em
 * andamento) que ainda não têm suporte no backend — aparecem só como
 * referência visual.
 */

export const STATUS_COR: Record<AppointmentStatus, string> = {
  PENDING: "#3b82f6", // azul — Agendado
  CONFIRMED: "#22c55e", // verde — Confirmado
  COMPLETED: "#6b7280", // cinza — Finalizado
  CANCELLED: "#7f1d1d", // vermelho fraco — Cancelado
  NO_SHOW: "#ec4899", // rosa — Faltou
};

export const STATUS_ROTULO: Record<AppointmentStatus, string> = {
  PENDING: "Agendado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Faltou",
};

/** Legenda completa de cores (referência visual). */
export const STATUS_LEGENDA: { label: string; cor: string }[] = [
  { label: "Agendado", cor: "#3b82f6" },
  { label: "Confirmado", cor: "#22c55e" },
  { label: "Chegou", cor: "#f97316" },
  { label: "Em andamento", cor: "#eab308" },
  { label: "Finalizado", cor: "#6b7280" },
  { label: "Cancelado", cor: "#7f1d1d" },
  { label: "Faltou", cor: "#ec4899" },
];
