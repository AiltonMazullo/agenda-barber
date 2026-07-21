"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RequirePermission } from "@/components/shared";

/**
 * Módulos protegidos por permissão de verdade no backend (mesmos prefixos e
 * módulos usados no `Navbar` para filtrar o menu). Cobre acesso direto por
 * URL — o menu já esconde o item, isso bloqueia quem digita a rota na mão.
 */
const PROTECTED_PREFIXES: { prefix: string; module: string | string[] }[] = [
  { prefix: "/access-control", module: "grupo_de_permissoes" },
  { prefix: "/professionals", module: "usuario" },
  { prefix: "/schedule", module: "agendamento" },
  { prefix: "/clients", module: "cliente" },
  { prefix: "/subscriptions", module: "cliente" },
  { prefix: "/orders", module: "comanda" },
  { prefix: "/cashier", module: "caixa" },
  { prefix: "/inventory", module: "produto" },
  { prefix: "/marketing", module: "configuracoes_de_whatsapp" },
  { prefix: "/dashboard", module: "dashboard" },
  { prefix: "/commissions", module: "comissao" },
  {
    prefix: "/financial",
    module: ["categoria_financeira", "movimentacoes", "contas_bancarias", "formas_de_pagamentos"],
  },
  { prefix: "/reports", module: "relatorio" },
  {
    prefix: "/settings",
    module: ["empresa", "filial", "servico", "categoria", "gateways_de_pagamento"],
  },
];

/** Rotas exclusivas do dono da conta (não delegáveis via grupo de acesso). */
const OWNER_ONLY_PREFIXES = ["/billing"];

export function DashboardPermissionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    return <RequirePermission ownerOnly>{children}</RequirePermission>;
  }

  const match = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p.prefix));
  if (!match) return <>{children}</>;

  return <RequirePermission module={match.module}>{children}</RequirePermission>;
}
