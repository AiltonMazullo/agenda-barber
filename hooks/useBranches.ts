/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { branchesService } from "@/services/branches.service";
import type {
  Branch,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/types/branch.types";

export function useBranches(barbershopId: string | undefined) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    branchesService
      .list(barbershopId)
      .then((data) => {
        if (active) setBranches(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar filiais.",
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
    async (payload: CreateBranchPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await branchesService.create(barbershopId, payload);
        setBranches((prev) => [...prev, created]);
        toast.success("Filial criada.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar filial.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateBranchPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await branchesService.update(barbershopId, id, payload);
        setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
        toast.success("Filial atualizada.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar filial.",
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
        await branchesService.remove(barbershopId, id);
        setBranches((prev) => prev.filter((b) => b.id !== id));
        toast.success("Filial removida.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover filial.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { branches, isLoading, create, update, remove };
}
