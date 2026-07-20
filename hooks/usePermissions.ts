"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

export function usePermissions() {
  const { permissions } = useAuth();

  return useMemo(() => {
    /**
     * `key` pode ser um módulo ("agendamento", pra menu/página) ou uma
     * permissão exata ("agendamento.cancelar", pra botão). `permissions === null`
     * = dono (acesso total).
     */
    function can(key: string): boolean {
      if (permissions === null) return true;
      return permissions.some((p) => p === key || p.startsWith(`${key}.`));
    }
    return { can };
  }, [permissions]);
}
