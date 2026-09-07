"use client";

import { useEffect, useState } from "react";
import { clientRepurchaseService } from "@/services/client-repurchase.service";
import type { ClientRepurchase } from "@/types/client-repurchase.types";

/** Fração do período de recompra cadastrado considerada "vencendo" (dias). */
const UPCOMING_MARGIN_RATIO = 0.2;

/**
 * Itens de recompra (`ClientRepurchase`) de um cliente vencidos ou vencendo —
 * usado pela seção "Itens para recompra" do modal de detalhe do agendamento.
 * Reaproveita o endpoint já existente `GET /client-repurchases?clientId=`
 * (populado por `AppointmentsService.updateStatus` ao concluir um
 * atendimento) e filtra no front, já que o backend não tem um filtro de data
 * dedicado para isso.
 *
 * A margem de "vencendo" segue a quantidade de dias de recompra cadastrada
 * em cada serviço/produto (`repurchasePeriodDays`) — 20% desse período,
 * limitada entre 3 e 30 dias — em vez de uma janela fixa igual para todos os
 * itens, já que um item que recompra a cada 7 dias e outro a cada 180 não
 * deveriam usar a mesma margem de antecedência.
 */
function upcomingMarginDays(repurchase: ClientRepurchase): number {
  const periodDays =
    repurchase.service?.repurchasePeriodDays ?? repurchase.product?.repurchasePeriodDays ?? null;
  if (!periodDays || periodDays <= 0) return 30;
  return Math.min(30, Math.max(3, Math.round(periodDays * UPCOMING_MARGIN_RATIO)));
}

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
        const now = new Date();
        setRepurchases(
          data
            .filter((r) => {
              const limit = new Date(r.repurchaseAt);
              limit.setDate(limit.getDate() - upcomingMarginDays(r));
              return limit <= now;
            })
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
