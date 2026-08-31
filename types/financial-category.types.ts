export type FinancialCategoryType = "PAYABLE" | "RECEIVABLE";
export type FinancialCategoryStatus = "ACTIVE" | "INACTIVE";

export interface FinancialCategory {
  id: string;
  name: string;
  type: FinancialCategoryType;
  parentCategoryId: string | null;
  status: FinancialCategoryStatus;
  /** spec-ajustes-escopo-2 §6.3: exibe o seletor de profissional no lançamento quando marcado. */
  requiresEmployee: boolean;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  parentCategory: { id: string; name: string } | null;
}

export interface CreateFinancialCategoryPayload {
  name: string;
  type: FinancialCategoryType;
  parentCategoryId?: string;
  requiresEmployee?: boolean;
}

export interface UpdateFinancialCategoryPayload {
  name?: string;
  parentCategoryId?: string | null;
  status?: FinancialCategoryStatus;
  requiresEmployee?: boolean;
}
