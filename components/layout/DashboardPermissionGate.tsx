"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RequirePermission } from "@/components/shared";

/**
 * Módulos protegidos por permissão de verdade no backend (mesmos prefixos
 * usados no `Navbar` para filtrar o menu). Cobre acesso direto por URL —
 * o menu já esconde o item, isso bloqueia quem digita a rota na mão.
 */
const PROTECTED_PREFIXES: { prefix: string; module: string }[] = [
  { prefix: "/access-control", module: "grupo_de_permissoes" },
  { prefix: "/professionals", module: "usuario" },
  { prefix: "/schedule", module: "agendamento" },
  { prefix: "/clients", module: "cliente" },
  { prefix: "/subscriptions", module: "cliente" },
  { prefix: "/orders", module: "comanda" },
  { prefix: "/cashier", module: "caixa" },
  { prefix: "/inventory", module: "produto" },
  { prefix: "/marketing", module: "configuracoes_de_whatsapp" },
];

export function DashboardPermissionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const match = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p.prefix));

  if (!match) return <>{children}</>;

  return <RequirePermission module={match.module}>{children}</RequirePermission>;
}
