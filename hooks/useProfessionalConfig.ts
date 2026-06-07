/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { professionalConfigStore } from "@/lib/professional-config-store";
import {
  defaultProfessionalConfig,
  type ProfessionalConfig,
} from "@/types/professional-config.types";

/** Carrega/salva a configuração estendida (local) de um profissional. */
export function useProfessionalConfig(
  barbershopId: string | undefined,
  employeeId: string | undefined,
) {
  const [config, setConfig] = useState<ProfessionalConfig>(
    defaultProfessionalConfig(),
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!barbershopId || !employeeId) return;
    setConfig(professionalConfigStore.get(barbershopId, employeeId));
    setLoaded(true);
  }, [barbershopId, employeeId]);

  /** Persiste a config informada. Retorna false se o localStorage recusou. */
  const save = useCallback(
    (next: ProfessionalConfig): boolean => {
      if (!barbershopId || !employeeId) return false;
      return professionalConfigStore.set(barbershopId, employeeId, next);
    },
    [barbershopId, employeeId],
  );

  return { config, setConfig, loaded, save };
}
