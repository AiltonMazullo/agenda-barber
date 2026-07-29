export type CategoryType = "PRODUTO" | "SERVICO";

export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  status: CategoryStatus;
  /** Desconto padrão (%) aplicável a itens desta categoria. */
  discountPercent: number | null;
  /** Comissão padrão (%) por profissional — fallback quando não há regra específica. */
  commissionPercent: number | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  status?: CategoryStatus;
  discountPercent?: number | null;
  commissionPercent?: number | null;
}

export interface UpdateCategoryPayload {
  name: string;
  status?: CategoryStatus;
  discountPercent?: number | null;
  commissionPercent?: number | null;
}
