/**
 * Comandas — camada **local** (localStorage).
 *
 * O backend ainda não expõe rotas de comandas (ver ROTAS.md), então o CRUD
 * fica no navegador, particionado por barbearia — mesmo padrão de
 * `stock-movements-store`. Agendamentos, produtos e serviços vinculados são
 * dados reais da API; apenas a comanda em si é persistida aqui.
 *
 * Quando a API existir, substituir este módulo por um `comandas.service.ts`
 * mantendo as mesmas assinaturas (o hook `useComandas` é o único consumidor).
 */

import type { Comanda, ComandaDraft, ComandaStatus } from "@/types/orders.types";

const KEY = "sm_comandas";

type ComandaMap = Record<string, Comanda[]>;

function readAll(): ComandaMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as ComandaMap;
  } catch {
    return {};
  }
}

function writeAll(map: ComandaMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

function nextNumero(comandas: Comanda[]): number {
  return comandas.reduce((max, c) => Math.max(max, c.numero), 1000) + 1;
}

export const comandasStore = {
  /** Comandas da barbearia, mais recentes primeiro. */
  list(barbershopId: string): Comanda[] {
    const items = readAll()[barbershopId] ?? [];
    return [...items].sort((a, b) => b.numero - a.numero);
  },

  get(barbershopId: string, id: string): Comanda | undefined {
    return (readAll()[barbershopId] ?? []).find((c) => c.id === id);
  },

  create(barbershopId: string, draft: ComandaDraft): Comanda {
    const map = readAll();
    const existing = map[barbershopId] ?? [];
    const now = new Date().toISOString();
    const comanda: Comanda = {
      ...draft,
      id: crypto.randomUUID(),
      numero: nextNumero(existing),
      status: "ABERTA",
      createdAt: now,
      updatedAt: now,
    };
    map[barbershopId] = [...existing, comanda];
    writeAll(map);
    return comanda;
  },

  update(
    barbershopId: string,
    id: string,
    draft: ComandaDraft,
  ): Comanda | undefined {
    const map = readAll();
    let updated: Comanda | undefined;
    map[barbershopId] = (map[barbershopId] ?? []).map((c) => {
      if (c.id !== id) return c;
      updated = { ...c, ...draft, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) writeAll(map);
    return updated;
  },

  setStatus(
    barbershopId: string,
    id: string,
    status: ComandaStatus,
  ): Comanda | undefined {
    const map = readAll();
    let updated: Comanda | undefined;
    map[barbershopId] = (map[barbershopId] ?? []).map((c) => {
      if (c.id !== id) return c;
      updated = { ...c, status, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) writeAll(map);
    return updated;
  },

  remove(barbershopId: string, id: string): void {
    const map = readAll();
    map[barbershopId] = (map[barbershopId] ?? []).filter((c) => c.id !== id);
    writeAll(map);
  },
};
