export type CategoryType = "PRODUTO" | "SERVICO";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
}

export interface UpdateCategoryPayload {
  name: string;
}
