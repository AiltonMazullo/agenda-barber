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

/** View-model de profissional (avatar = iniciais; fotoUrl quando há upload). */
export interface ProfissionalVM {
  id: string;
  nome: string;
  avatar: string;
  /** URL completa da foto de perfil, quando cadastrada. */
  fotoUrl?: string | null;
  ativo: boolean;
}

/** Situação de assinatura do cliente, para o ícone de assinante. */
export type AssinanteSituacao = "ativo" | "inadimplente" | null;

/** View-model de agendamento já resolvido para a agenda do dia. */
export interface AgendamentoVM {
  id: string;
  servicoId: string;
  profissionalId: string;
  /** Nome do profissional resolvido (mesmo se fora da filial filtrada). */
  profissionalNome: string;
  cliente: string;
  telefone: string;
  inicioMin: number; // minutos desde meia-noite
  duracao: number; // minutos
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

/** Dados de ativação de plano (coletados na confirmação do agendamento). */
export interface PlanoAtivacaoInput {
  /** Dia de início da vigência. */
  dataInicio: Date;
  /** Forma de pagamento (ex.: "DINHEIRO", "PIX", ...). */
  formaPagamento: string;
  /** Dia do mês de vencimento (1–31). */
  vencimento: number;
  /** CPF do cliente (obrigatório para ativar). */
  cpf: string;
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
  /** Presente apenas quando o usuário optou por ativar um plano. */
  planoAtivacao?: PlanoAtivacaoInput;
}

/** Dados para criação rápida de cliente (mini-form do dialog). */
export interface QuickClientInput {
  name: string;
  phone: string;
  email?: string;
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
