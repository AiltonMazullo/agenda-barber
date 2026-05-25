"use client";

import { DollarSign } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/shared";

export default function FinanceiroPage() {
  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Financeiro"
        subtitle="Contas a pagar, a receber e fluxo de caixa"
      />
      <ComingSoon
        icon={<DollarSign className="size-6" />}
        title="Gestão financeira"
        description="Em desenvolvimento. Em breve você terá controle completo de contas a pagar e receber, com categorias customizáveis."
        features={[
          "Contas a pagar com categorias e vencimento",
          "Contas a receber por cliente e plano",
          "Geração automática de lançamentos a partir das comandas",
          "Balanço por período e fluxo de caixa",
        ]}
      />
    </div>
  );
}
