"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { commissionClubService } from "@/services/commission-club.service";
import type {
  CommissionClubRun,
  CreateCommissionRunPayload,
} from "@/types/commission-club.types";

export function useCommissionClub(barbershopId: string | undefined) {
  const [runs, setRuns] = useState<CommissionClubRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await commissionClubService.list(barbershopId);
      setRuns(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar histórico.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchRuns();
  }, [barbershopId, fetchRuns]);

  const create = useCallback(
    async (payload: CreateCommissionRunPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await commissionClubService.create(barbershopId, payload);
        toast.success("Cálculo de comissão salvo.");
        await fetchRuns();
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao salvar cálculo.");
        return null;
      }
    },
    [barbershopId, fetchRuns],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await commissionClubService.remove(barbershopId, id);
        toast.success("Registro removido.");
        await fetchRuns();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao remover registro.");
        return false;
      }
    },
    [barbershopId, fetchRuns],
  );

  const distribute = useCallback(
    async (id: string) => {
      if (!barbershopId) return null;
      try {
        const result = await commissionClubService.distribute(barbershopId, id);
        toast.success("Rateio distribuído.");
        await fetchRuns();
        return result;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao distribuir rateio.");
        return null;
      }
    },
    [barbershopId, fetchRuns],
  );

  return { runs, isLoading, create, remove, distribute };
}
