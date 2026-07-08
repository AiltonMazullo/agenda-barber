"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared";
import { ComandaForm } from "@/components/orders";
import { useAuth } from "@/hooks/useAuth";
import { useComandas } from "@/hooks/useComandas";
import type { ComandaDraft } from "@/types/orders.types";

export default function NovaComandaPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { create } = useComandas(barbershop?.id);

  async function handleSubmit(draft: ComandaDraft) {
    const criada = await create(draft);
    if (criada) router.push("/orders");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Nova Comanda"
        subtitle="Vincule os agendamentos e registre os produtos e serviços consumidos"
      />
      <ComandaForm
        barbershopId={barbershop?.id}
        submitLabel="Criar comanda"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
