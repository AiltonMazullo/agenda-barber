export type FinancialCategoryType = "PAYABLE" | "RECEIVABLE";
export type FinancialCategoryStatus = "ACTIVE" | "INACTIVE";

export interface FinancialCategory {
  id: string;
  name: string;
  type: FinancialCategoryType;
  parentCategoryId: string | null;
  status: FinancialCategoryStatus;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  parentCategory: { id: string; name: string } | null;
}

export interface CreateFinancialCategoryPayload {
  name: string;
  type: FinancialCategoryType;
  parentCategoryId?: string;
}

export interface UpdateFinancialCategoryPayload {
  name?: string;
  parentCategoryId?: string | null;
  status?: FinancialCategoryStatus;
}
