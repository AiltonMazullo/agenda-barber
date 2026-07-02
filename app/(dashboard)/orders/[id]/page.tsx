/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Loading } from "@/components/shared";
import { ComandaForm } from "@/components/orders/ComandaForm";
import { mockComandasStore } from "@/components/orders/mocks";
import type { Comanda, ComandaFormValues } from "@/types/orders.types";

export default function EditarComandaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [comanda, setComanda] = useState<Comanda | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setComanda(mockComandasStore.get(params.id) ?? null);
  }, [params.id]);

  function handleSubmit(values: ComandaFormValues) {
    mockComandasStore.update(params.id, values);
    router.push(`/orders?atualizada=${params.id}`);
  }

  if (comanda === undefined) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }

  if (comanda === null) {
    return (
      <div className="space-y-4 p-6 bg-surface-base min-h-screen text-foreground">
        <PageHeader title="Comanda não encontrada" />
        <p className="text-sm text-muted-foreground">
          Essa comanda pode ter sido excluída. Volte para a listagem e
          tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title={`Editar Comanda #${comanda.numero}`}
        subtitle="Atualize os produtos e serviços vinculados a este agendamento"
      />
      <ComandaForm comanda={comanda} onSubmit={handleSubmit} />
    </div>
  );
}