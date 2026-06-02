"use client";

import { useMemo } from "react";
import type { AccessModulePermission } from "@/types/access-group.types";

export type PermissionAction = "create" | "read" | "update" | "delete";

/**
 * Fonte isolada das permissões do usuário logado no painel.
 *
 * Hoje **só o dono** loga (acesso total) → retorna `null`, que o `can()`
 * interpreta como acesso irrestrito. Quando o **login de funcionário** existir,
 * basta esta função passar a devolver `accessGroup.modules` do funcionário
 * autenticado — o resto do gating já funciona.
 */
function useCurrentModules(): AccessModulePermission[] | null {
  // TODO(backend): ler os módulos do accessGroup do funcionário logado.
  return null; // null = dono / acesso total
}

export function usePermissions() {
  const modules = useCurrentModules();

  return useMemo(() => {
    function can(
      moduleKey: string,
      action: PermissionAction = "read",
    ): boolean {
      if (modules === null) return true; // dono = acesso total
      const m = modules.find((x) => x.module === moduleKey);
      return m ? m[action] : false;
    }
    return { can };
  }, [modules]);
}
