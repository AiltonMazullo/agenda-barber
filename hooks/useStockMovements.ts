/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { stockMovementsService } from "@/services/stock-movements.service";
import type {
  NewStockMovementBatchInput,
  NewStockMovementInput,
  StockMovement,
} from "@/types/inventory.types";

/**
 * Histórico de movimentações de estoque (entradas, saídas e vendas),
 * persistido no backend com auditoria real (funcionário/dono logado).
 */
export function useStockMovements(barbershopId: string | undefined) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    stockMovementsService
      .list(barbershopId)
      .then((data) => {
        if (active) setMovements(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar movimentações.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  const addMovement = useCallback(
    async (input: NewStockMovementInput) => {
      if (!barbershopId) return null;
      try {
        const created = await stockMovementsService.create(barbershopId, input);
        setMovements((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao registrar movimentação.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const addBatch = useCallback(
    async (input: NewStockMovementBatchInput) => {
      if (!barbershopId) return null;
      try {
        const created = await stockMovementsService.createBatch(barbershopId, input);
        setMovements((prev) => [...created, ...prev]);
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao registrar movimentações.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  return { movements, isLoading, addMovement, addBatch };
}
