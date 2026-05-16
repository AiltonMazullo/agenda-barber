import { api } from "@/lib/api";
import type {
  CreateProductPayload,
  Product,
  ProductStock,
  UpdateProductPayload,
  UpsertStockPayload,
} from "@/types/product.types";

export const productsService = {
  async list(barbershopId: string): Promise<Product[]> {
    const { data } = await api.get<Product[]>(
      `/barbershops/${barbershopId}/products`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateProductPayload,
  ): Promise<Product> {
    const { data } = await api.post<Product>(
      `/barbershops/${barbershopId}/products`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateProductPayload,
  ): Promise<Product> {
    const { data } = await api.put<Product>(
      `/barbershops/${barbershopId}/products/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/products/${id}`);
  },

  async listStock(
    barbershopId: string,
    productId: string,
  ): Promise<ProductStock[]> {
    const { data } = await api.get<ProductStock[]>(
      `/barbershops/${barbershopId}/products/${productId}/stock`,
    );
    return data;
  },

  async upsertStock(
    barbershopId: string,
    productId: string,
    branchId: string,
    payload: UpsertStockPayload,
  ): Promise<ProductStock> {
    const { data } = await api.put<ProductStock>(
      `/barbershops/${barbershopId}/products/${productId}/stock/${branchId}`,
      payload,
    );
    return data;
  },
};
