/**
 * Movimentações de estoque — camada **local** (localStorage).
 *
 * O backend não expõe histórico de entradas/saídas/vendas, então registramos as
 * movimentações no frontend por barbearia. O estoque real continua sendo
 * atualizado via `upsertStock`; aqui guardamos só o log de auditoria.
 */

import type { StockMovement } from "@/types/inventory.types";

const KEY = "sm_stock_movements";

type MovementMap = Record<string, StockMovement[]>;

function readAll(): MovementMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as MovementMap;
  } catch {
    return {};
  }
}

function writeAll(map: MovementMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export const stockMovementsStore = {
  /** Movimentações da barbearia, mais recentes primeiro. */
  list(barbershopId: string): StockMovement[] {
    const items = readAll()[barbershopId] ?? [];
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  add(barbershopId: string, movement: StockMovement): void {
    const map = readAll();
    map[barbershopId] = [...(map[barbershopId] ?? []), movement];
    writeAll(map);
  },
};
