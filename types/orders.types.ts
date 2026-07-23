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

/** Forma de pagamento da comanda (enum legado, ver spec-financeiro). */
export type ComandaFormaPagamento =
  | "DINHEIRO"
  | "CREDITO"
  | "DEBITO"
  | "PIX"
  | "OUTRO";

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
  /** Filial da comanda — usada para baixa de estoque e vínculo com o caixa. */
  branchId: string | null;
  /** Profissional responsável, em comandas de Consumo. */
  employeeId: string | null;
  formaPagamento: ComandaFormaPagamento | null;
  /** Caixa aberto da filial no momento em que a comanda foi fechada. */
  cashRegisterId: string | null;
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
  branchId?: string | null;
  employeeId?: string | null;
  formaPagamento?: ComandaFormaPagamento | null;
}
