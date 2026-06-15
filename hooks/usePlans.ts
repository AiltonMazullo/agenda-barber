"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { plansService } from "@/services/plans.service";
import type { CreatePlanPayload, Plan, UpdatePlanPayload } from "@/types/plan.types";

export function usePlans(barbershopId: string | undefined) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    plansService
      .listAdmin(barbershopId)
      .then((data) => {
        if (active) setPlans(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(err instanceof Error ? err.message : "Falha ao carregar planos.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  const create = useCallback(
    async (payload: CreatePlanPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await plansService.create(barbershopId, payload);
        setPlans((prev) => [...prev, created]);
        toast.success("Plano criado.");
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao criar plano.");
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (planId: string, payload: UpdatePlanPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await plansService.update(barbershopId, planId, payload);
        setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
        toast.success("Plano atualizado.");
        return updated;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao atualizar plano.");
        return null;
      }
    },
    [barbershopId],
  );

  const deactivate = useCallback(
    async (planId: string) => {
      if (!barbershopId) return false;
      try {
        const updated = await plansService.updateStatus(barbershopId, planId, { status: "INACTIVE" });
        setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
        toast.success("Plano desativado.");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao desativar plano.");
        return false;
      }
    },
    [barbershopId],
  );

  const activate = useCallback(
    async (planId: string) => {
      if (!barbershopId) return false;
      try {
        const updated = await plansService.updateStatus(barbershopId, planId, { status: "ACTIVE" });
        setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
        toast.success("Plano ativado.");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao ativar plano.");
        return false;
      }
    },
    [barbershopId],
  );

  return { plans, isLoading, create, update, deactivate, activate };
}
