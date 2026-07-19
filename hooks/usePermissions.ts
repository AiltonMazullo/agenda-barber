"use client";

import { useMemo } from "react";

/**
 * Fonte isolada das permissões do usuário logado no painel.
 *
 * Hoje **só o dono** loga (acesso total) → retorna `null`, que o `can()`
 * interpreta como acesso irrestrito. Quando o **login de funcionário** existir,
 * basta esta função passar a devolver as chaves de permissão (`AccessGroup.permissions`)
 * do funcionário autenticado — o resto do gating já funciona.
 */
function useCurrentPermissions(): string[] | null {
  // TODO(backend): ler as permissões do accessGroup do funcionário logado.
  return null; // null = dono / acesso total
}

export function usePermissions() {
  const permissions = useCurrentPermissions();

  return useMemo(() => {
    function can(moduleName: string): boolean {
      if (permissions === null) return true; // dono = acesso total
      return permissions.some((key) => key.startsWith(`${moduleName}.`));
    }
    return { can };
  }, [permissions]);
}
