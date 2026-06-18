"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { productsService } from "@/services/products.service";
import type {
  CreateProductPayload,
  Product,
  ProductStock,
  UpdateProductPayload,
  UpsertStockPayload,
} from "@/types/product.types";

/** Produto enriquecido com o estoque agregado entre todas as filiais. */
export interface ProductWithStock extends Product {
  stockPerBranch: ProductStock[];
  totalCurrent: number;
  totalMin: number;
}

async function loadStockSafe(
  barbershopId: string,
  productId: string,
): Promise<ProductStock[]> {
  try {
    return await productsService.listStock(barbershopId, productId);
  } catch {
    return [];
  }
}

function withAggregates(product: Product, stock: ProductStock[]): ProductWithStock {
  return {
    ...product,
    stockPerBranch: stock,
    totalCurrent: stock.reduce((acc, s) => acc + s.currentStock, 0),
    totalMin: stock.reduce((acc, s) => acc + s.minStock, 0),
  };
}

interface UseProductsOptions {
  /**
   * Carrega o estoque por filial de cada produto já no load (1 GET por
   * produto). Use apenas em telas que **exibem** estoque (ex.: aba Estoque,
   * relatório de estoque). Padrão `false` — telas que só usam nome/preço do
   * produto (ex.: assinaturas) não disparam essas chamadas. Estoque sob
   * demanda fica disponível via `loadStock(productId)`.
   */
  withStock?: boolean;
}

export function useProducts(
  barbershopId: string | undefined,
  { withStock = false }: UseProductsOptions = {},
) {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);

    (async () => {
      try {
        const list = await productsService.list(barbershopId);
        if (!active) return;
        if (withStock) {
          const stockArrays = await Promise.all(
            list.map((p) => loadStockSafe(barbershopId, p.id)),
          );
          if (!active) return;
          setProducts(list.map((p, i) => withAggregates(p, stockArrays[i])));
        } else {
          setProducts(list.map((p) => withAggregates(p, [])));
        }
      } catch (err) {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar produtos.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [barbershopId, withStock]);

  /** Carrega o estoque de um produto sob demanda (ex.: ao abrir o produto). */
  const loadStock = useCallback(
    async (productId: string) => {
      if (!barbershopId) return;
      const stock = await loadStockSafe(barbershopId, productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? withAggregates(p, stock) : p)),
      );
    },
    [barbershopId],
  );

  const create = useCallback(
    async (payload: CreateProductPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await productsService.create(barbershopId, payload);
        setProducts((prev) => [...prev, withAggregates(created, [])]);
        toast.success("Produto criado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar produto.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateProductPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await productsService.update(barbershopId, id, payload);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...withAggregates(updated, p.stockPerBranch) }
              : p,
          ),
        );
        toast.success("Produto atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar produto.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await productsService.remove(barbershopId, id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Produto removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover produto.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  const upsertStock = useCallback(
    async (
      productId: string,
      branchId: string,
      payload: UpsertStockPayload,
    ) => {
      if (!barbershopId) return null;
      try {
        const stock = await productsService.upsertStock(
          barbershopId,
          productId,
          branchId,
          payload,
        );
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id !== productId) return p;
            const idx = p.stockPerBranch.findIndex(
              (s) => s.branchId === branchId,
            );
            const nextStock =
              idx >= 0
                ? p.stockPerBranch.map((s, i) => (i === idx ? stock : s))
                : [...p.stockPerBranch, stock];
            return withAggregates(p, nextStock);
          }),
        );
        return stock;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao salvar estoque.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  return { products, isLoading, loadStock, create, update, remove, upsertStock };
}
