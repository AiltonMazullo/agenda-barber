"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Plus, Trash2 } from "lucide-react";
import { PageHeader, EmptyState, ConfirmDialog, Loading, StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useCommissionClub } from "@/hooks/useCommissionClub";
import { formatBRL, formatDate } from "@/utils/format";
import type { CommissionClubRun } from "@/types/commission-club.types";

export default function ComissaoClubeHistoricoPage() {
  const { barbershop } = useAuth();
  const { runs, isLoading, remove } = useCommissionClub(barbershop?.id);
  const [toDelete, setToDelete] = useState<CommissionClubRun | null>(null);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Comissão de assinaturas"
        subtitle="Histórico dos cálculos de soma e divisão do pote de clube"
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
              href="/subscriptions/comissao/novo"
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Calcular novo
            </Link>
          </div>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised divide-y divide-border-subtle">
        {isLoading ? (
          <Loading />
        ) : runs.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhum cálculo de comissão de clube ainda." />
          </div>
        ) : (
          runs.map((run) => (
            <div
              key={run.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{run.branch.name}</p>
                  <StatusBadge tone={run.distributedAt ? "success" : "warning"}>
                    {run.distributedAt ? "Distribuído" : "Rascunho"}
                  </StatusBadge>
                  {run.editedAt && <StatusBadge tone="info">Alterado</StatusBadge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(run.periodStart)} — {formatDate(run.periodEnd)} · Pote:{" "}
                  {formatBRL(run.totalPoolInCents / 100)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/subscriptions/comissao/${run.id}`}
                  className="h-9 px-3 rounded-md border border-border bg-transparent text-xs font-semibold text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
                >
                  <Eye className="size-3.5" />
                  Relatório
                </Link>
                {!run.distributedAt && (
                  <button
                    type="button"
                    onClick={() => setToDelete(run)}
                    className="size-9 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Remover cálculo?"
        description="Este rascunho de comissão será removido permanentemente."
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => toDelete && remove(toDelete.id)}
      />
    </div>
  );
}
