"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * Bloqueia o acesso a uma página do dashboard quando o usuário logado não tem
 * a permissão do módulo. Complementa o filtro de menu (`Navbar`), que já
 * esconde o item — isso cobre o caso de acesso direto pela URL.
 */
export function RequirePermission({
  module,
  children,
}: {
  module: string;
  children: ReactNode;
}) {
  const { can } = usePermissions();

  if (!can(module)) {
    return (
      <div className="min-h-screen bg-surface-base grid place-items-center p-6 text-center">
        <div className="space-y-3">
          <ShieldAlert className="size-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-xs text-muted-foreground">
            Fale com o responsável pela sua barbearia para liberar o acesso.
          </p>
          <Link
            href="/dashboard"
            className="inline-block text-xs font-bold text-brand hover:underline"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
