"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

export function usePermissions() {
  const { permissions } = useAuth();

  return useMemo(() => {
    /**
     * `key` pode ser um módulo ("agendamento", pra menu/página) ou uma
     * permissão exata ("agendamento.cancelar", pra botão). Também aceita uma
     * lista de módulos — basta ter QUALQUER UM deles (ex.: uma página que
     * reúne abas de módulos diferentes, como Financeiro ou Configurações).
     * `permissions === null` = dono (acesso total).
     */
    function can(key: string | string[]): boolean {
      if (permissions === null) return true;
      const keys = Array.isArray(key) ? key : [key];
      return keys.some((k) => permissions.some((p) => p === k || p.startsWith(`${k}.`)));
    }
    return { can };
  }, [permissions]);
}
