import type { AppointmentStatus } from "@/types/appointment.types";

/**
 * Cores e rótulos de situação do agendamento na agenda.
 *
 * O backend hoje só expõe 4 status (PENDING/CONFIRMED/COMPLETED/CANCELLED).
 * A legenda visual lista as 7 situações previstas; as ainda não suportadas
 * pelo backend (Chegou, Em andamento, Faltou) aparecem só como referência.
 */

export const STATUS_COR: Record<AppointmentStatus, string> = {
  PENDING: "#3b82f6", // azul — Agendado
  CONFIRMED: "#22c55e", // verde — Confirmado
  COMPLETED: "#6b7280", // cinza — Finalizado
  CANCELLED: "#7f1d1d", // vermelho fraco — Cancelado
};

export const STATUS_ROTULO: Record<AppointmentStatus, string> = {
  PENDING: "Agendado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

/** Legenda completa de cores (referência visual). */
export const STATUS_LEGENDA: { label: string; cor: string }[] = [
  { label: "Agendado", cor: "#3b82f6" },
  { label: "Confirmado", cor: "#22c55e" },
  { label: "Chegou", cor: "#f97316" },
  { label: "Em andamento", cor: "#eab308" },
  { label: "Finalizado", cor: "#6b7280" },
  { label: "Cancelado", cor: "#7f1d1d" },
  { label: "Faltou", cor: "#ffffff" },
];
