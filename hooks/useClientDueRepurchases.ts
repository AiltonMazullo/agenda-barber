"use client";

import { useEffect, useState } from "react";
import { clientRepurchaseService } from "@/services/client-repurchase.service";
import type { ClientRepurchase } from "@/types/client-repurchase.types";

/** Margem considerada "vencendo" além do vencido (dias). */
const UPCOMING_MARGIN_DAYS = 30;

/**
 * Itens de recompra (`ClientRepurchase`) de um cliente vencidos ou vencendo
 * dentro de `UPCOMING_MARGIN_DAYS` — usado pela seção "Itens para recompra"
 * do modal de detalhe do agendamento. Reaproveita o endpoint já existente
 * `GET /client-repurchases?clientId=` (populado por
 * `AppointmentsService.updateStatus` ao concluir um atendimento) e filtra no
 * front, já que o backend não tem um filtro de data dedicado para isso.
 */
export function useClientDueRepurchases(
  barbershopId: string | undefined,
  clientId: string | undefined,
  enabled: boolean,
) {
  const [repurchases, setRepurchases] = useState<ClientRepurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!barbershopId || !clientId || !enabled) {
      setRepurchases([]);
      return;
    }
    let active = true;
    setIsLoading(true);
    clientRepurchaseService
      .list(barbershopId, clientId)
      .then((data) => {
        if (!active) return;
        const limit = new Date();
        limit.setDate(limit.getDate() + UPCOMING_MARGIN_DAYS);
        setRepurchases(
          data
            .filter((r) => new Date(r.repurchaseAt) <= limit)
            .sort(
              (a, b) =>
                new Date(a.repurchaseAt).getTime() - new Date(b.repurchaseAt).getTime(),
            ),
        );
      })
      .catch(() => {
        if (active) setRepurchases([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId, clientId, enabled]);

  return { repurchases, isLoading };
}
