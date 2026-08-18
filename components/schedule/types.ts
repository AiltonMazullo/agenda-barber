import type { AppointmentStatus } from "@/types/appointment.types";

/** Tamanho do slot da agenda em minutos. */
export type SlotSize = 10 | 20 | 30;
export type ViewMode = "kanban" | "lista" | "mes";
export type Origem = "online" | "recepcao";

export const SLOT_OPTIONS = [10, 20, 30] as const;
export const START_HOUR = 8;
export const END_HOUR = 20;

/** Id sentinela para `AgendamentoVM.profissionalId` de agendamentos "sem preferência" (`employeeId: null`) — não corresponde a nenhum `ProfissionalVM` real. */
export const SEM_PREFERENCIA_ID = "sem-prof";

/** View-model de serviço (cor em hex, preço em reais). */
export interface ServicoVM {
  id: string;
  nome: string;
  cor: string; // hex
  tempoPadrao: number; // minutos
  preco: number; // reais
  /** Serviço de encaixe — quando agrupado com outro serviço no mesmo agendamento, não soma tempo próprio ao card (§3.2). */
  fitIn?: boolean;
}

/** View-model de profissional (avatar = iniciais; fotoUrl quando há upload). */
export interface ProfissionalVM {
  id: string;
  nome: string;
  avatar: string;
  /** URL completa da foto de perfil, quando cadastrada. */
  fotoUrl?: string | null;
  ativo: boolean;
  /** Filial do profissional — usado para filtrar por filial no modal de criação. */
  branchId?: string | null;
}

/** Situação de assinatura do cliente, para o ícone de assinante. */
export type AssinanteSituacao = "ativo" | "inadimplente" | null;

/** View-model de agendamento já resolvido para a agenda do dia. */
export interface AgendamentoVM {
  id: string;
  /** Id do cliente — usado para buscar plano ativo e histórico de agendamentos. */
  clientId: string;
  /** Serviço primário (o primeiro do grupo) — mantido para compatibilidade com quem só exibe um serviço. */
  servicoId: string;
  /** Todos os serviços do agendamento combo, na ordem em que foram agendados (1 item = serviço único). */
  servicos: { id: string; nome: string }[];
  /** Ids de todos os Appointments que compõem este card (para ações que precisam atingir o grupo inteiro). */
  memberIds: string[];
  /** Agrupa agendamentos criados na mesma reserva combo — null quando é um serviço único. */
  groupId: string | null;
  profissionalId: string;
  /** Nome do profissional resolvido (mesmo se fora da filial filtrada). */
  profissionalNome: string;
  /** True quando o agendamento foi salvo sem profissional definido ("sem preferência") — `employeeId: null` no backend. */
  semPreferencia: boolean;
  /** Filial do agendamento (`Appointment.branchId`). Null em registros legados criados antes do campo existir. */
  branchId: string | null;
  cliente: string;
  telefone: string;
  inicioMin: number; // minutos desde meia-noite
  duracao: number; // minutos — soma da duração de todos os serviços do grupo
  /** Dia do agendamento no fuso local, "yyyy-MM-dd" — usado pela visão de mês. */
  dataIso: string;
  status: AppointmentStatus;
  origem: Origem;
  observacao?: string;
  /** Primeiro agendamento (de qualquer status) já feito por este cliente. */
  primeiroAgendamento: boolean;
  /** null = não é assinante; "ativo"/"inadimplente" conforme a última fatura. */
  assinante: AssinanteSituacao;
  /** Aniversário do cliente cai na semana corrente. */
  aniversarianteSemana: boolean;
  /** Cliente tem observação interna cadastrada. */
  temNota: boolean;
}

/** Um serviço escolhido no agendamento (com profissional opcional). */
export interface ServicoSelecionado {
  servicoId: string;
  /** Profissional opcional para este serviço. */
  profissionalId?: string;
  /** Duração em minutos (default = tempo padrão do serviço). */
  duracao: number;
  /** Valor em reais. */
  valor: number;
}

/** Dados para criar um novo agendamento (saída do dialog). */
export interface NovoAgendamentoInput {
  clientId: string;
  /** Um ou mais serviços, executados em sequência a partir do horário. */
  servicos: ServicoSelecionado[];
  /** Dia do agendamento. */
  data: Date;
  /** "HH:mm" */
  hora: string;
  observacao?: string;
  /** Definida automaticamente pelo sistema (recepção no painel). */
  origem: Origem;
  /** Situação escolhida pelo dono ao cadastrar (default "PENDING"/Agendado). */
  status?: AppointmentStatus;
}

/** Dados para criação rápida de cliente (mini-form do dialog). */
export interface QuickClientInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  /** ISO 8601. */
  birthDate: string;
  howMet: string;
}

/** Bloqueio de horário — persistido no backend (ver `useScheduleBlocks`). */
export interface BloqueioHorario {
  id: string;
  profissionalId: string; // "todos" para todos
  inicioMin: number;
  duracaoMin: number;
  motivo?: string;
  tipo: "bloqueio";
  /** Dia do bloqueio no fuso local, "yyyy-MM-dd" — só se aplica nesse dia. */
  dataIso: string;
}

/**
 * Segmento de indisponibilidade somente leitura, derivado da configuração do
 * profissional (horários/intervalos), folgas e feriados da barbearia — ao
 * contrário de `BloqueioHorario`, não é criado/editado/removido pela agenda
 * (só muda quando a configuração de origem muda). Ver `buildIndisponibilidades`.
 */
export type IndisponibilidadeTipo =
  | "fora-expediente"
  | "intervalo"
  | "feriado"
  | "folga";

export interface Indisponibilidade {
  id: string;
  profissionalId: string;
  inicioMin: number;
  fimMin: number;
  tipo: IndisponibilidadeTipo;
  label: string;
}
