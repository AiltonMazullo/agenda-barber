/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { clientPlanStore } from "@/lib/client-plan-store";
import { defaultClientPlan, type ClientPlan } from "@/types/client-plan.types";

/**
 * Plano/assinatura simulado do cliente (localStorage). Lido em effect para
 * evitar mismatch de hidratação. `update` persiste e reflete no estado.
 */
export function useClientPlan(barbershopId: string | undefined): {
  plan: ClientPlan;
  update: (patch: Partial<ClientPlan>) => void;
} {
  const [plan, setPlan] = useState<ClientPlan>(defaultClientPlan());

  useEffect(() => {
    if (!barbershopId) return;
    setPlan(clientPlanStore.get(barbershopId));
  }, [barbershopId]);

  const update = useCallback(
    (patch: Partial<ClientPlan>) => {
      if (!barbershopId) return;
      clientPlanStore.set(barbershopId, patch);
      setPlan(clientPlanStore.get(barbershopId));
    },
    [barbershopId],
  );

  return { plan, update };
}
