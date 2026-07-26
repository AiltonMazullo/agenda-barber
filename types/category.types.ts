export type CategoryType = "PRODUTO" | "SERVICO";

export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  status: CategoryStatus;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  status?: CategoryStatus;
}

export interface UpdateCategoryPayload {
  name: string;
  status?: CategoryStatus;
}
