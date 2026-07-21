/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { categoriesService } from "@/services/categories.service";
import type { Category, CategoryType } from "@/types/category.types";

/** Categorias são sempre de um tipo só — cada chamador escolhe PRODUTO ou SERVICO. */
export function useCategories(
  barbershopId: string | undefined,
  type: CategoryType,
) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    categoriesService
      .list(barbershopId, type)
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar categorias.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId, type]);

  const create = useCallback(
    async (name: string) => {
      if (!barbershopId) return null;
      try {
        const created = await categoriesService.create(barbershopId, { name, type });
        setCategories((prev) => [...prev, created]);
        toast.success("Categoria criada.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar categoria.",
        );
        return null;
      }
    },
    [barbershopId, type],
  );

  const update = useCallback(
    async (id: string, name: string) => {
      if (!barbershopId) return null;
      try {
        const updated = await categoriesService.update(barbershopId, id, { name });
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
        toast.success("Categoria atualizada.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar categoria.",
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
        await categoriesService.remove(barbershopId, id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success("Categoria removida.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover categoria.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { categories, isLoading, create, update, remove };
}
