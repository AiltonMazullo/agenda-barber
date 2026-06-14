/**
 * Persistência **local** (localStorage) do plano/assinatura simulado do cliente.
 * Mantido no frontend até o backend expor planos. Keyed por barbershopId
 * (uma assinatura simulada por barbearia, suficiente para a demonstração).
 */

import {
  defaultClientPlan,
  type ClientPlan,
  type ClientPlanRules,
} from "@/types/client-plan.types";

const KEY = "sm_client_plan";

function readAll(): Record<string, ClientPlan> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
      string,
      ClientPlan
    >;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, ClientPlan>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

function merge(stored: Partial<ClientPlan> | undefined): ClientPlan {
  const base = defaultClientPlan();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    rules: { ...base.rules, ...(stored.rules as Partial<ClientPlanRules>) },
  };
}

export const clientPlanStore = {
  get(barbershopId: string): ClientPlan {
    return merge(readAll()[barbershopId]);
  },
  set(barbershopId: string, patch: Partial<ClientPlan>): void {
    const map = readAll();
    const current = merge(map[barbershopId]);
    map[barbershopId] = {
      ...current,
      ...patch,
      rules: { ...current.rules, ...(patch.rules ?? {}) },
    };
    writeAll(map);
  },
};
