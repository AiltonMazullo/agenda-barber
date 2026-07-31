"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Loading, PageHeader, StatusBadge } from "@/components/shared";
import { ComandaForm } from "@/components/orders";
import { useAuth } from "@/hooks/useAuth";
import { useComandas } from "@/hooks/useComandas";
import type { ComandaDraft, ComandaStatus } from "@/types/orders.types";
import type { Tone } from "@/types/common.types";

const STATUS_LABEL: Record<ComandaStatus, string> = {
  ABERTA: "Aberta",
  FECHADA: "Fechada",
  CANCELADA: "Cancelada",
};

const STATUS_TONE: Record<ComandaStatus, Tone> = {
  ABERTA: "brand",
  FECHADA: "success",
  CANCELADA: "danger",
};

export default function EditarComandaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { barbershop } = useAuth();
  const { comandas, isLoading, update, setStatus } = useComandas(barbershop?.id);
  const [reopening, setReopening] = useState(false);

  const comanda = useMemo(
    () => comandas.find((c) => c.id === params.id) ?? null,
    [comandas, params.id],
  );

  async function handleSubmit(draft: ComandaDraft) {
    const atualizada = await update(params.id, draft);
    if (atualizada) router.push("/orders");
  }

  async function handleReopen() {
    setReopening(true);
    await setStatus(params.id, "ABERTA");
    setReopening(false);
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 bg-surface-base min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!comanda) {
    return (
      <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
        <PageHeader
          title="Comanda não encontrada"
          subtitle="Essa comanda pode ter sido excluída."
        />
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para as comandas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title={`Comanda #${comanda.numero}`}
        subtitle="Atualize os agendamentos, produtos e serviços desta comanda"
        actions={
          <StatusBadge tone={STATUS_TONE[comanda.status]}>
            {STATUS_LABEL[comanda.status]}
          </StatusBadge>
        }
      />
      <ComandaForm
        key={comanda.id}
        barbershopId={barbershop?.id}
        comanda={comanda}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
        onReopen={handleReopen}
        reopening={reopening}
      />
    </div>
  );
}
