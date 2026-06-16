"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { plansService } from "@/services/plans.service";
import type { CreatePlanPayload, Plan, UpdatePlanPayload } from "@/types/plan.types";

export function usePlans(barbershopId: string | undefined) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await plansService.listAdmin(barbershopId);
      setPlans(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar planos.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchPlans();
  }, [barbershopId, fetchPlans]);

  const create = useCallback(
    async (payload: CreatePlanPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await plansService.create(barbershopId, payload);
        toast.success("Plano criado.");
        await fetchPlans();
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao criar plano.");
        return null;
      }
    },
    [barbershopId, fetchPlans],
  );

  const update = useCallback(
    async (planId: string, payload: UpdatePlanPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await plansService.update(barbershopId, planId, payload);
        toast.success("Plano atualizado.");
        await fetchPlans();
        return updated;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao atualizar plano.");
        return null;
      }
    },
    [barbershopId, fetchPlans],
  );

  const deactivate = useCallback(
    async (planId: string) => {
      if (!barbershopId) return false;
      try {
        await plansService.updateStatus(barbershopId, planId, { status: "INACTIVE" });
        toast.success("Plano desativado.");
        await fetchPlans();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao desativar plano.");
        return false;
      }
    },
    [barbershopId, fetchPlans],
  );

  const activate = useCallback(
    async (planId: string) => {
      if (!barbershopId) return false;
      try {
        await plansService.updateStatus(barbershopId, planId, { status: "ACTIVE" });
        toast.success("Plano ativado.");
        await fetchPlans();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao ativar plano.");
        return false;
      }
    },
    [barbershopId, fetchPlans],
  );

  return { plans, isLoading, create, update, deactivate, activate };
}
