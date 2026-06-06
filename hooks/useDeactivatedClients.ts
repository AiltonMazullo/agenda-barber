/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { deactivatedClientsStore } from "@/lib/deactivated-clients-store";

/** Estado reativo da lista de clientes desativados (persistida localmente). */
export function useDeactivatedClients(barbershopId: string | undefined) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (barbershopId) setIds(deactivatedClientsStore.list(barbershopId));
  }, [barbershopId]);

  const deactivate = useCallback(
    (clientId: string) => {
      if (!barbershopId) return;
      deactivatedClientsStore.deactivate(barbershopId, clientId);
      setIds(deactivatedClientsStore.list(barbershopId));
    },
    [barbershopId],
  );

  const reactivate = useCallback(
    (clientId: string) => {
      if (!barbershopId) return;
      deactivatedClientsStore.reactivate(barbershopId, clientId);
      setIds(deactivatedClientsStore.list(barbershopId));
    },
    [barbershopId],
  );

  const isDeactivated = useCallback(
    (clientId: string) => ids.includes(clientId),
    [ids],
  );

  return { ids, deactivate, reactivate, isDeactivated };
}
