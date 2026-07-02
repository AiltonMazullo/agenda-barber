"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared";
import { ComandaForm } from "@/components/orders/ComandaForm";
import { mockComandasStore } from "@/components/orders/mocks";
import type { ComandaFormValues } from "@/types/orders.types";

export default function NovaComandaPage() {
  const router = useRouter();

  function handleSubmit(values: ComandaFormValues) {
    const criada = mockComandasStore.create(values);
    router.push(`/orders?criada=${criada.numero}`);
  }

  return (
    <div className="space-y-6 p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Nova Comanda"
        subtitle="Vincule um agendamento e adicione os produtos e serviços consumidos"
      />
      <ComandaForm onSubmit={handleSubmit} />
    </div>
  );
}
