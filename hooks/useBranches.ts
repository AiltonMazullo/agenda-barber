/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { branchesService } from "@/services/branches.service";
import {
  branchConfigStore,
  type BranchConfigExtras,
} from "@/lib/branch-config-store";
import type {
  Branch,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/types/branch.types";

/** Extrai os campos de configuração local de um payload de filial. */
function pickExtras(
  p: CreateBranchPayload | UpdateBranchPayload,
): BranchConfigExtras {
  return {
    cnpj: p.cnpj ?? null,
  };
}

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
        if (active) setBranches(data.map((b) => branchConfigStore.merge(b)));
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
        const extras = pickExtras(payload);
        branchConfigStore.set(created.id, extras);
        const merged = { ...created, ...extras };
        setBranches((prev) => [...prev, merged]);
        toast.success("Filial criada.");
        return merged;
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
        branchConfigStore.set(id, pickExtras(payload));
        const merged = branchConfigStore.merge(updated);
        setBranches((prev) => prev.map((b) => (b.id === id ? merged : b)));
        toast.success("Filial atualizada.");
        return merged;
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
        branchConfigStore.remove(id);
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

  /**
   * Atualiza apenas os campos de configuração local (flags, taxas, etc.) sem
   * chamar o backend — usado para toggles rápidos (ex.: checkboxes da filial).
   */
  const patchConfig = useCallback((id: string, extras: BranchConfigExtras) => {
    branchConfigStore.set(id, extras);
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...extras } : b)),
    );
  }, []);

  return { branches, isLoading, create, update, remove, patchConfig };
}
