/**
 * Tipos espelhando o modelo `Branch` (filial) do backend.
 *
 * Os campos de configuração financeira/visibilidade (cnpj, flags, taxas, prazo,
 * conta bancária) são **opcionais** — ainda não persistidos pelo backend (o
 * modelo atual só guarda os campos de endereço). São coletados na UI e ficam
 * prontos para integração quando as rotas suportarem.
 */

import type { PaymentMethod } from "@/types/cash-register.types";

/** Forma de pagamento aceita pela filial + taxa (%). */
export interface BranchPaymentConfig {
  method: PaymentMethod;
  /** Taxa em porcentagem (ex.: 2.5 = 2,5%). */
  feePercent: number;
}

export interface Branch {
  id: string;
  name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  // ─── Configuração independente da filial (opcional, pendente de backend) ──
  cnpj?: string | null;
  /** Marca a filial como responsável pelos recebimentos da empresa. */
  isReceivingBranch?: boolean;
  /** Oculta a filial de seleções públicas (vitrine, agendamento). */
  isHidden?: boolean;
  /** Prazo para recebimento, em dias. */
  receiptDeadlineDays?: number | null;
  /** Conta bancária associada (descrição: banco / agência / conta). */
  bankAccount?: string | null;
  /** Formas de pagamento aceitas + taxas. */
  paymentConfigs?: BranchPaymentConfig[];
}

export interface CreateBranchPayload {
  name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement?: string;
  // ─── Opcionais (UI; backend ignora até suportar) ──────────────────────────
  cnpj?: string;
  isReceivingBranch?: boolean;
  isHidden?: boolean;
  receiptDeadlineDays?: number;
  bankAccount?: string;
  paymentConfigs?: BranchPaymentConfig[];
}

export interface UpdateBranchPayload {
  name?: string;
  email?: string;
  phone?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
  cnpj?: string;
  isReceivingBranch?: boolean;
  isHidden?: boolean;
  receiptDeadlineDays?: number;
  bankAccount?: string;
  paymentConfigs?: BranchPaymentConfig[];
}
