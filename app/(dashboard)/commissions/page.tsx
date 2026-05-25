"use client";

import { TrendingUp } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/shared";

export default function ComissoesPage() {
  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Comissões"
        subtitle="Apuração de comissões por profissional"
      />
      <ComingSoon
        icon={<TrendingUp className="size-6" />}
        title="Cálculo de comissões"
        description="Em desenvolvimento. Em breve você apurará comissões por atendimento, por venda de produto e por assinatura."
        features={[
          "Comissão por serviço executado",
          "Comissão por venda de produto",
          "Rateio de pote de assinaturas",
          "Geração automática em contas a pagar",
        ]}
      />
    </div>
  );
}
