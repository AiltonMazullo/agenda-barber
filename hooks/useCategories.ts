"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { categoriesService } from "@/services/categories.service";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";

export function useCategories(barbershopId: string | undefined) {
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
      .list(barbershopId)
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
  }, [barbershopId]);

  const create = useCallback(
    async (payload: CreateCategoryPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await categoriesService.create(barbershopId, payload);
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
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateCategoryPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await categoriesService.update(barbershopId, id, payload);
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
