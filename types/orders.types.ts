/**
 * Tipos do domínio de Comandas.
 *
 * Uma comanda agrupa o consumo de um atendimento: um ou mais agendamentos
 * e os produtos/serviços consumidos, cada item atrelado a um dos
 * agendamentos vinculados (ou a nenhum, em comandas de consumo avulso).
 * Preço sempre em centavos (inteiro), como no restante do app.
 */

export type ComandaStatus = "ABERTA" | "FECHADA" | "CANCELADA";

/** AGENDAMENTO = vinculada à agenda · AVULSA = consumo sem agendamento. */
export type ComandaTipo = "AGENDAMENTO" | "AVULSA";

export type ComandaItemTipo = "PRODUTO" | "SERVICO";

/**
 * Snapshot do agendamento no momento em que foi vinculado à comanda.
 * Guardar nome/serviço/profissional aqui mantém a comanda legível mesmo
 * que o agendamento seja alterado ou removido depois.
 */
export interface ComandaAgendamento {
  appointmentId: string;
  clienteNome: string;
  servicoNome: string;
  profissionalNome: string | null;
  /** ISO datetime do agendamento. */
  scheduledAt: string;
}

export interface ComandaItem {
  id: string;
  tipo: ComandaItemTipo;
  /** Id do Product/Service de origem no catálogo. */
  refId: string;
  nome: string;
  categoriaNome: string | null;
  /** Agendamento ao qual o item está atrelado (null em comanda avulsa). */
  appointmentId: string | null;
  quantidade: number;
  valorUnitarioInCents: number;
}

export interface Comanda {
  id: string;
  /** Número sequencial por barbearia, exibido como #1024. */
  numero: number;
  tipo: ComandaTipo;
  status: ComandaStatus;
  /** Nome do cliente em comandas avulsas (sem agendamento). */
  clienteAvulso: string | null;
  agendamentos: ComandaAgendamento[];
  itens: ComandaItem[];
  observacoes: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload de criação/edição — o store completa id, numero, status e datas. */
export interface ComandaDraft {
  tipo: ComandaTipo;
  clienteAvulso: string | null;
  agendamentos: ComandaAgendamento[];
  itens: ComandaItem[];
  observacoes: string;
}
