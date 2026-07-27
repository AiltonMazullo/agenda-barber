export type FinancialEntryType = "PAYABLE" | "RECEIVABLE";
export type FinancialEntryStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
export type FinancialEntryPaymentCondition = "AVISTA" | "PARCELADO" | "RECORRENTE";

export interface FinancialEntry {
  id: string;
  type: FinancialEntryType;
  description: string;
  valueInCents: number;
  categoryId: string | null;
  discountPercent: number | null;
  interestPercent: number | null;
  observations: string | null;
  paymentCondition: FinancialEntryPaymentCondition;
  installmentsTotal: number | null;
  installmentNumber: number | null;
  isRecurring: boolean;
  recurrenceDay: number | null;
  paymentMethodId: string | null;
  expensePaymentMethodId: string | null;
  bankAccountId: string | null;
  dueDate: string;
  paidAt: string | null;
  status: FinancialEntryStatus;
  branchId: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
  paymentMethod: { id: string; name: string } | null;
  expensePaymentMethod: { id: string; name: string } | null;
  bankAccount: { id: string; name: string } | null;
  branch: { id: string; name: string } | null;
}

export interface FinancialEntryFilters {
  type?: FinancialEntryType;
  status?: FinancialEntryStatus;
  categoryId?: string;
  branchId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  paymentMethodId?: string;
  bankAccountId?: string;
  search?: string;
}

export interface CreateFinancialEntryPayload {
  type: FinancialEntryType;
  description: string;
  valueInCents: number;
  categoryId?: string;
  discountPercent?: number;
  interestPercent?: number;
  observations?: string;
  paymentCondition: FinancialEntryPaymentCondition;
  installmentsTotal?: number;
  isRecurring: boolean;
  recurrenceDay?: number;
  paymentMethodId?: string;
  expensePaymentMethodId?: string;
  bankAccountId?: string;
  branchId?: string;
  dueDate: string;
}

export interface UpdateFinancialEntryPayload {
  description?: string;
  valueInCents?: number;
  categoryId?: string | null;
  discountPercent?: number | null;
  interestPercent?: number | null;
  observations?: string | null;
  paymentMethodId?: string | null;
  expensePaymentMethodId?: string | null;
  bankAccountId?: string | null;
  branchId?: string | null;
  dueDate?: string;
}

export interface FinancialBalanceSection {
  overdue?: number;
  notReceived?: number;
  upcoming: number;
  paid?: number;
  received?: number;
  total: number;
}

export interface FinancialBalance {
  payable: { overdue: number; upcoming: number; paid: number; total: number };
  receivable: { notReceived: number; upcoming: number; received: number; total: number };
  balance: number;
  projectedBalance: number;
  totalFeesInCents: number;
}

export interface GenerateCommissionsPayload {
  periodStart: string;
  periodEnd: string;
  dryRun: boolean;
  bonusByEmployee: Record<string, number>;
  valeByEmployee: Record<string, number>;
  /** Valor total recebido de assinaturas no período (centavos). */
  subscriptionRevenueInCents?: number;
  /** Percentual do pote de comissão do Clube (0–100) aplicado sobre `subscriptionRevenueInCents`. */
  commissionPercent?: number;
}

export interface CommissionResultRow {
  employeeId: string;
  employeeName: string;
  servicesAvulsoInCents: number;
  servicesProdutoInCents: number;
  servicesClubInCents: number;
  /** Líquido por categoria (gross menos vale, quando `valeDeductionSource` da
   * barbearia aponta para essa categoria específica — ver
   * financial-entries.service.ts `generateCommissions`). Igual ao valor bruto
   * quando o desconto não sai dessa categoria. */
  servicesAvulsoLiquidoInCents: number;
  servicesProdutoLiquidoInCents: number;
  servicesClubLiquidoInCents: number;
  bonusInCents: number;
  valeInCents: number;
  totalInCents: number;
  totalLiquidoInCents: number;
}

export interface GenerateCommissionsResult {
  dryRun: boolean;
  results: CommissionResultRow[];
  createdEntryIds: string[];
}
