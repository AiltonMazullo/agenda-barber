"use client";

import { ClipboardList } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/shared";

export default function ComandasPage() {
  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Comandas"
        subtitle="Atendimentos em andamento e fechamento de comanda"
      />
      <ComingSoon
        icon={<ClipboardList className="size-6" />}
        title="Gestão de comandas"
        description="Em desenvolvimento. Em breve você abrirá comandas vinculadas aos agendamentos e fechará com pagamento integrado."
        features={[
          "Abrir comanda a partir de um agendamento",
          "Adicionar serviços extras e produtos no atendimento",
          "Fechar com Pix, cartão ou dinheiro",
          "Reabrir comanda no histórico",
        ]}
      />
    </div>
  );
}
