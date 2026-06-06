/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { stockMovementsStore } from "@/lib/stock-movements-store";
import type { StockMovement } from "@/types/inventory.types";

/**
 * Histórico local de movimentações de estoque (entradas, saídas e vendas),
 * mais recentes primeiro. O estoque real continua sendo atualizado via
 * `upsertStock`; aqui guardamos apenas o log com auditoria.
 */
export function useStockMovements(barbershopId: string | undefined) {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    if (!barbershopId) return;
    setMovements(stockMovementsStore.list(barbershopId));
  }, [barbershopId]);

  const addMovement = useCallback(
    (movement: StockMovement) => {
      if (!barbershopId) return;
      stockMovementsStore.add(barbershopId, movement);
      setMovements((prev) => [movement, ...prev]);
    },
    [barbershopId],
  );

  return { movements, addMovement };
}
