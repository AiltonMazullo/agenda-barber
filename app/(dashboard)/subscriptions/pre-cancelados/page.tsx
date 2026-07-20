"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, UserMinus } from "lucide-react";
import {
  PageHeader,
  EmptyState,
  ConfirmDialog,
  Loading,
  StatusBadge,
} from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { usePreCancelledClients } from "@/hooks/usePreCancelledClients";
import { CANCEL_REASON_OPTIONS } from "@/types/pre-cancelled-client.types";
import { formatDate } from "@/utils/format";
import type { PreCancelledClient } from "@/types/pre-cancelled-client.types";

const STATUS_TONE: Record<PreCancelledClient["status"], "success" | "danger" | "warning"> = {
  SUCESSO: "success",
  ERRO: "danger",
  AGUARDANDO: "warning",
};

function reasonLabel(reason: string): string {
  return CANCEL_REASON_OPTIONS.find((r) => r.value === reason)?.label ?? reason;
}

export default function PreCanceladosPage() {
  const { barbershop } = useAuth();
  const { items, isLoading, remove } = usePreCancelledClients(barbershop?.id);
  const [toDelete, setToDelete] = useState<PreCancelledClient | null>(null);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Clientes pré-cancelados"
        subtitle="Pipeline de clientes em risco de saída, ainda recuperáveis"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/subscriptions"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Voltar
            </Link>
            <Link
              href="/subscriptions/pre-cancelados/novo"
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Novo
            </Link>
          </div>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised divide-y divide-border-subtle">
        {isLoading ? (
          <Loading />
        ) : items.length === 0 ? (
          <div className="py-6">
            <EmptyState icon={<UserMinus className="size-10" />} message="Nenhum cliente pré-cancelado." />
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {item.subscription.client.name}
                  </p>
                  <StatusBadge tone={STATUS_TONE[item.status]}>{item.status}</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.subscription.plan.name} · cancelamento em {formatDate(item.cancelDate)} ·{" "}
                  {reasonLabel(item.reason)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToDelete(item)}
                className="size-9 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors shrink-0"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Remover pré-cancelado?"
        description={
          toDelete
            ? `O agendamento de cancelamento de "${toDelete.subscription.client.name}" será removido.`
            : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => toDelete && remove(toDelete.id)}
      />
    </div>
  );
}
