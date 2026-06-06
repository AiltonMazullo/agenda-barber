/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { productCostStore } from "@/lib/product-cost-store";

/**
 * Custo unitário (centavos) por produto, persistido localmente.
 * Usado no card "Custo do estoque" e no campo "Custo unitário".
 */
export function useProductCosts(barbershopId: string | undefined) {
  const [costs, setCosts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!barbershopId) return;
    setCosts(productCostStore.all(barbershopId));
  }, [barbershopId]);

  const costOf = useCallback(
    (productId: string) => costs[productId] ?? 0,
    [costs],
  );

  const setCost = useCallback(
    (productId: string, costInCents: number) => {
      if (!barbershopId) return;
      productCostStore.set(barbershopId, productId, costInCents);
      setCosts((prev) => ({ ...prev, [productId]: Math.max(0, costInCents) }));
    },
    [barbershopId],
  );

  const removeCost = useCallback(
    (productId: string) => {
      if (!barbershopId) return;
      productCostStore.remove(barbershopId, productId);
      setCosts((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    },
    [barbershopId],
  );

  return { costs, costOf, setCost, removeCost };
}
