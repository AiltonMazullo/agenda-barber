export interface Category {
  id: string;
  name: string;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name: string;
}
