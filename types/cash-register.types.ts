import type { Branch } from "@/types/branch.types";

/**
 * Tipos do módulo de Caixas (Cash Registers).
 * Valores monetários sempre em centavos (inteiros).
 */

export type TransactionType = "ENTRY" | "EXIT";

export type PaymentMethod =
  | "DINHEIRO"
  | "CARTAO_DEBITO"
  | "CARTAO_CREDITO"
  | "PIX"
  | "OUTRO";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: "Dinheiro",
  CARTAO_DEBITO: "Cartão de Débito",
  CARTAO_CREDITO: "Cartão de Crédito",
  PIX: "PIX",
  OUTRO: "Outro",
};

export interface CashTransaction {
  id: string;
  name: string;
  valueInCents: number;
  description: string | null;
  type: TransactionType;
  paymentMethod?: PaymentMethod | null;
  cashRegisterId: string;
  createdAt: string;
}

export interface CashRegister {
  id: string;
  barbershopId: string;
  branchId: string;
  createdAt: string;
  /** `null` = caixa aberto; data/hora = fechado. */
  closedAt: string | null;
  branch: Branch;
  /** Presente apenas no GET por ID. */
  transactions?: CashTransaction[];
  /** Valor em espécie registrado na abertura (centavos). Frontend-computed via transação "Saldo inicial". */
  openingCashInCents?: number;
  /** Dinheiro contado fisicamente na gaveta ao fechar (centavos). Só preenchido após o fechamento. */
  countedCashInCents?: number | null;
  /** `countedCashInCents - dinheiro esperado`, calculado no fechamento. Pode ser negativo. */
  cashDifferenceInCents?: number | null;
}

export interface CreateCashRegisterPayload {
  branchId: string;
}

export interface UpdateCashRegisterPayload {
  branchId: string;
}

export interface ClosePayload {
  /** Valor contado fisicamente na gaveta ao fechar (centavos). Opcional para não travar fechamentos rápidos. */
  countedCashInCents?: number;
}

export interface CashRegisterClosingSummary {
  /** Dinheiro que deveria estar na gaveta: movimentações do caixa + comandas fechadas em dinheiro no período. */
  expectedCashInCents: number;
  /** Saldo (entradas − saídas) das movimentações lançadas diretamente no caixa. */
  transactionsBalanceInCents: number;
  /** Soma das comandas fechadas em dinheiro, na filial e período do caixa. */
  comandasDinheiroInCents: number;
  /** Cobranças de assinatura pagas manualmente (billingType MANUAL) recebidas no dia. */
  manualSubscriptionsInCents: number;
}

export interface NewTransactionInput {
  name: string;
  valueInCents: number;
  type: TransactionType;
  paymentMethod?: PaymentMethod;
  description?: string;
}

export interface AddTransactionsPayload {
  transactions: NewTransactionInput[];
}

export const OPENING_TRANSACTION_NAME = "Saldo inicial em espécie";
