import type { Comanda, ComandaItem } from "@/types/orders.types";

/** Soma dos itens da comanda, em centavos. */
export function comandaTotalInCents(itens: ComandaItem[]): number {
  return itens.reduce(
    (acc, item) => acc + item.quantidade * item.valorUnitarioInCents,
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
