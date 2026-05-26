"use client";

import { CreditCard } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/shared";

export default function AssinaturasPage() {
  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Assinaturas"
        subtitle="Planos recorrentes e contratos ativos"
      />
      <ComingSoon
        icon={<CreditCard className="size-6" />}
        title="Planos de assinatura"
        description="Em desenvolvimento. Em breve você criará planos recorrentes (mensal, trimestral, anual) e cobranças automáticas via gateway."
        features={[
          "Cadastro de planos com ciclo e benefícios",
          "Vincular clientes aos planos",
          "Cobrança automática via GalaxPay",
          "Indicadores de churn e retenção",
        ]}
      />
    </div>
  );
}
