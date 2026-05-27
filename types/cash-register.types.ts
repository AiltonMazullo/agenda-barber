import type { Branch } from "@/types/branch.types";

/**
 * Tipos do módulo de Caixas (Cash Registers).
 * Valores monetários sempre em centavos (inteiros).
 */

export type TransactionType = "ENTRY" | "EXIT";

export interface CashTransaction {
  id: string;
  name: string;
  valueInCents: number;
  description: string | null;
  type: TransactionType;
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
}

export interface CreateCashRegisterPayload {
  branchId: string;
}

export interface NewTransactionInput {
  name: string;
  valueInCents: number;
  type: TransactionType;
  description?: string;
}

export interface AddTransactionsPayload {
  transactions: NewTransactionInput[];
}
