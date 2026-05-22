export const SLOT_OPTIONS = [10, 20, 30] as const;
export const START_HOUR = 8;
export const END_HOUR = 20;

export type SlotSize = 10 | 20 | 30;

export type ScheduleViewMode = "kanban" | "lista" | "reais";

export interface BloqueioHorario {
  id: string;
  /** ID do profissional ou "todos" para bloquear todos. */
  profissionalId: string;
  inicioMin: number;
  duracaoMin: number;
  motivo?: string;
  tipo: "bloqueio";
}

export interface ScheduleFilial {
  id: string;
  nome: string;
  cidade: string;
}
