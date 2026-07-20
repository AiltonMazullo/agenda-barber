"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

/** Só renderiza os filhos se o usuário logado tiver a permissão (módulo ou chave exata). */
export function Can({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { can } = usePermissions();
  if (!can(permission)) return null;
  return <>{children}</>;
}
