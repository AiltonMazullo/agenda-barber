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
  /** Desconto aplicado ao item no fechamento (ver DialogFecharComanda). */
  descontoInCents: number;
}

/** Forma de pagamento da comanda (enum legado, ver spec-financeiro). */
export type ComandaFormaPagamento =
  | "DINHEIRO"
  | "CREDITO"
  | "DEBITO"
  | "PIX"
  | "OUTRO";

/**
 * Uma forma de pagamento usada no fechamento — a comanda pode ser fechada
 * com o pagamento dividido entre mais de uma (ver DialogFecharComanda).
 */
export interface ComandaPagamento {
  id: string;
  cashRegisterId: string;
  formaPagamento: ComandaFormaPagamento;
  valorInCents: number;
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
  /** Filial da comanda — usada para baixa de estoque e vínculo com o caixa. */
  branchId: string | null;
  /** Profissional responsável, em comandas de Consumo. */
  employeeId: string | null;
  /** Resumo legado — só preenchido quando há exatamente 1 pagamento no fechamento. */
  formaPagamento: ComandaFormaPagamento | null;
  /** Caixa aberto da filial no momento em que a comanda foi fechada (resumo legado). */
  cashRegisterId: string | null;
  /** Formas de pagamento usadas no fechamento — pode haver mais de uma (split). */
  pagamentos: ComandaPagamento[];
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
