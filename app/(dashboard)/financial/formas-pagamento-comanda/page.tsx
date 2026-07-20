"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PageHeader, EmptyState, ConfirmDialog, Loading, StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import type { PaymentMethodConfig } from "@/types/payment-method.types";

export default function FormasPagamentoComandaPage() {
  const { barbershop } = useAuth();
  const { methods, isLoading, remove } = usePaymentMethods(barbershop?.id);
  const [toDelete, setToDelete] = useState<PaymentMethodConfig | null>(null);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Formas de pagamento de comanda"
        subtitle="Formas de pagamento do sistema"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/financial"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Voltar
            </Link>
            <Link
              href="/financial/formas-pagamento-comanda/novo"
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
        ) : methods.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhuma forma de pagamento cadastrada." />
          </div>
        ) : (
          methods.map((m) => (
            <div
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{m.name}</p>
                  <StatusBadge tone="neutral">
                    {m.timing === "AVISTA" ? "À vista" : "A prazo"}
                  </StatusBadge>
                  <StatusBadge tone={m.status === "ACTIVE" ? "success" : "neutral"}>
                    {m.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </StatusBadge>
                </div>
                {m.branchConfigs.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.branchConfigs.length} filial(is) configurada(s)
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setToDelete(m)}
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
        title="Remover forma de pagamento?"
        description={
          toDelete ? `"${toDelete.name}" será removida (ou inativada, se estiver em uso).` : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => toDelete && remove(toDelete.id)}
      />
    </div>
  );
}
