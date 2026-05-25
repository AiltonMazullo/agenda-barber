"use client";

import { CreditCard } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/shared";

export default function BillingPage() {
  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Meu Plano"
        subtitle="Assinatura do Agendle e faturamento"
      />
      <ComingSoon
        icon={<CreditCard className="size-6" />}
        title="Plano e cobrança"
        description="Em desenvolvimento. Em breve você gerenciará sua assinatura do Agendle, fará upgrade de plano e acompanhará as cobranças."
        features={[
          "Visualização do plano atual e benefícios",
          "Upgrade/downgrade entre planos",
          "Histórico de faturas e recibos",
          "Métodos de pagamento da assinatura",
        ]}
      />
    </div>
  );
}
