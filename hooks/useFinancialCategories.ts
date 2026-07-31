"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { financialCategoriesService } from "@/services/financial-categories.service";
import type {
  CreateFinancialCategoryPayload,
  FinancialCategory,
  FinancialCategoryType,
  UpdateFinancialCategoryPayload,
} from "@/types/financial-category.types";

export function useFinancialCategories(
  barbershopId: string | undefined,
  type?: FinancialCategoryType,
) {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await financialCategoriesService.list(barbershopId, type);
      setCategories(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar categorias.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId, type]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchCategories();
  }, [barbershopId, fetchCategories]);

  const create = useCallback(
    async (payload: CreateFinancialCategoryPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await financialCategoriesService.create(barbershopId, payload);
        toast.success("Categoria cadastrada.");
        await fetchCategories();
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao cadastrar categoria.");
        return null;
      }
    },
    [barbershopId, fetchCategories],
  );

  const update = useCallback(
    async (id: string, payload: UpdateFinancialCategoryPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await financialCategoriesService.update(barbershopId, id, payload);
        toast.success("Categoria atualizada.");
        await fetchCategories();
        return updated;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao atualizar categoria.");
        return null;
      }
    },
    [barbershopId, fetchCategories],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await financialCategoriesService.remove(barbershopId, id);
        toast.success("Categoria removida.");
        await fetchCategories();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao remover categoria.");
        return false;
      }
    },
    [barbershopId, fetchCategories],
  );

  return { categories, isLoading, create, update, remove };
}
