import type {
  Comanda,
  ComandaDraft,
  ComandaFormaPagamento,
  ComandaItem,
} from "@/types/orders.types";

/** Rótulos da forma de pagamento da comanda, coletada no fechamento. */
export const COMANDA_FORMA_PAGAMENTO_LABELS: Record<ComandaFormaPagamento, string> = {
  DINHEIRO: "Dinheiro",
  CREDITO: "Cartão de Crédito",
  DEBITO: "Cartão de Débito",
  PIX: "PIX",
  OUTRO: "Outro",
};

export const COMANDA_FORMA_PAGAMENTO_OPTIONS: {
  value: ComandaFormaPagamento;
  label: string;
}[] = (
  Object.entries(COMANDA_FORMA_PAGAMENTO_LABELS) as [ComandaFormaPagamento, string][]
).map(([value, label]) => ({ value, label }));

/** Soma líquida (bruto - desconto por item) dos itens da comanda, em centavos. */
export function comandaTotalInCents(itens: ComandaItem[]): number {
  return itens.reduce(
    (acc, item) =>
      acc + item.quantidade * item.valorUnitarioInCents - item.descontoInCents,
    0,
  );
}

/** Nome exibido como "dono" da comanda na listagem. */
export function comandaClienteLabel(comanda: Comanda): string {
  if (comanda.tipo === "AVULSA") {
    return comanda.clienteAvulso?.trim() || "Cliente avulso";
  }
  return comanda.agendamentos[0]?.clienteNome ?? "—";
}

/**
 * Reconstrói o draft editável a partir de uma comanda carregada — usado no
 * fechamento (DialogFecharComanda) para persistir os descontos aplicados aos
 * itens via `update()` antes de chamar `setStatus(FECHADA)`.
 */
export function comandaToDraft(comanda: Comanda): ComandaDraft {
  return {
    tipo: comanda.tipo,
    clienteAvulso: comanda.clienteAvulso,
    agendamentos: comanda.agendamentos,
    itens: comanda.itens,
    observacoes: comanda.observacoes,
    branchId: comanda.branchId,
    employeeId: comanda.employeeId,
    formaPagamento: comanda.formaPagamento,
  };
}
