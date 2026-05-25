"use client";

import { Wallet } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/shared";

export default function CaixaPage() {
  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Caixa"
        subtitle="Abertura, fechamento e movimentações financeiras do dia"
      />
      <ComingSoon
        icon={<Wallet className="size-6" />}
        title="Controle de caixa"
        description="Em desenvolvimento. Em breve você abrirá e fechará caixas diários com conciliação automática das comandas."
        features={[
          "Abertura com valor inicial em dinheiro",
          "Entradas e saídas manuais durante o dia",
          "Fechamento com conferência (esperado vs. contado)",
          "Histórico de caixas anteriores",
        ]}
      />
    </div>
  );
}
