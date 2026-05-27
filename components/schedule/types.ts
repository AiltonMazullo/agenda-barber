import type { AppointmentStatus } from "@/types/appointment.types";

/** Tamanho do slot da agenda em minutos. */
export type SlotSize = 10 | 20 | 30;
export type ViewMode = "kanban" | "lista";
export type Origem = "online" | "recepcao";

export const SLOT_OPTIONS = [10, 20, 30] as const;
export const START_HOUR = 8;
export const END_HOUR = 20;

/** View-model de serviço (cor em hex, preço em reais). */
export interface ServicoVM {
  id: string;
  nome: string;
  cor: string; // hex
  tempoPadrao: number; // minutos
  preco: number; // reais
}

/** View-model de profissional (avatar = iniciais). */
export interface ProfissionalVM {
  id: string;
  nome: string;
  avatar: string;
  ativo: boolean;
}

/** View-model de agendamento já resolvido para a agenda do dia. */
export interface AgendamentoVM {
  id: string;
  servicoId: string;
  profissionalId: string;
  cliente: string;
  telefone: string;
  inicioMin: number; // minutos desde meia-noite
  duracao: number; // minutos
  status: AppointmentStatus;
  origem: Origem;
  observacao?: string;
}

/** Dados para criar um novo agendamento (saída do dialog). */
export interface NovoAgendamentoInput {
  clientId: string;
  serviceId: string;
  employeeId: string;
  /** "HH:mm" */
  hora: string;
  observacao?: string;
  origem: Origem;
}

/** Bloqueio de horário — apenas local (sem persistência no backend). */
export interface BloqueioHorario {
  id: string;
  profissionalId: string; // "todos" para todos
  inicioMin: number;
  duracaoMin: number;
  motivo?: string;
  tipo: "bloqueio";
}
