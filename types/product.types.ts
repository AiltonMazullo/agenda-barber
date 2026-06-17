/**
 * Tipos espelhando o modelo `Product` do backend.
 * Preço sempre em centavos (inteiro).
 */

export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  priceInCents: number;
  sku: string | null;
  ncm: string | null;
  gtin: string | null;
  cest: string | null;
  categoryId: string | null;
  category: ProductCategory | null;
  repurchasePeriodDays: number | null;
  status: ProductStatus;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  priceInCents: number;
  sku?: string;
  ncm?: string;
  gtin?: string;
  cest?: string;
  categoryId?: string | null;
  repurchasePeriodDays?: number;
  status?: ProductStatus;
}

export interface UpdateProductPayload {
  name?: string;
  priceInCents?: number;
  sku?: string;
  ncm?: string;
  gtin?: string;
  cest?: string;
  categoryId?: string | null;
  repurchasePeriodDays?: number;
  status?: ProductStatus;
}

export interface ProductStock {
  id: string;
  productId: string;
  branchId: string;
  minStock: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertStockPayload {
  minStock: number;
  currentStock: number;
}
