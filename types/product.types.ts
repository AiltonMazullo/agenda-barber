/**
 * Tipos espelhando o modelo `Product` do backend.
 * Preço sempre em centavos (inteiro).
 */

export type ProductCategory =
  | "CLOTHING"
  | "BARBERSHOP_COSMETICS"
  | "BAR"
  | "BARBERSHOP_ACCESSORIES";

export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface Product {
  id: string;
  name: string;
  priceInCents: number;
  sku: string | null;
  ncm: string | null;
  gtin: string | null;
  cest: string | null;
  category: ProductCategory;
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
  category: ProductCategory;
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
  category?: ProductCategory;
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
