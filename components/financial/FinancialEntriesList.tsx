"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { EmptyState, ConfirmDialog, Loading, StatusBadge } from "@/components/shared";
import { useFinancialEntries } from "@/hooks/useFinancialEntries";
import { formatBRL, formatDate, formatTime } from "@/utils/format";
import type { FinancialEntry, FinancialEntryType } from "@/types/financial-entry.types";

const STATUS_TONE: Record<FinancialEntry["status"], "success" | "danger" | "warning" | "neutral"> = {
  PAID: "success",
  OVERDUE: "danger",
  PENDING: "warning",
  CANCELLED: "neutral",
};

const STATUS_LABEL: Record<FinancialEntry["status"], string> = {
  PAID: "Pago",
  OVERDUE: "Vencido",
  PENDING: "A vencer",
  CANCELLED: "Cancelado",
};

interface FinancialEntriesListProps {
  barbershopId: string | undefined;
  /** Quando omitido, lista lançamentos de ambos os tipos (uso no Balanço, §4.4). */
  type?: FinancialEntryType;
  /** Href do botão "Adicionar"; quando omitido, o botão não é exibido. */
  newHref?: string;
  branchId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  categoryIds?: string[];
  /** Modo somente-leitura: esconde ações de marcar pago/remover e o botão de adicionar. */
  readOnly?: boolean;
  /** Esconde o grid de totalizadores (útil quando a página-mãe já exibe os totais, ex. Balanço). */
  hideTotals?: boolean;
}

export function FinancialEntriesList({
  barbershopId,
  type,
  newHref,
  branchId,
  dueDateFrom,
  dueDateTo,
  search,
  categoryIds,
  readOnly = false,
  hideTotals = false,
}: FinancialEntriesListProps) {
  const { entries, isLoading, markPaid, remove } = useFinancialEntries(barbershopId, {
    type,
    branchId,
    dueDateFrom,
    dueDateTo,
    search,
    categoryIds,
  });
  const [toDelete, setToDelete] = useState<FinancialEntry | null>(null);

  const totalizadores = entries.reduce(
    (acc, e) => {
      acc.total += e.valueInCents;
      if (e.status === "PAID") acc.pago += e.valueInCents;
      else if (e.status === "OVERDUE") acc.vencido += e.valueInCents;
      else if (e.status === "PENDING") acc.aVencer += e.valueInCents;
      return acc;
    },
    { vencido: 0, aVencer: 0, pago: 0, total: 0 },
  );

  return (
    <div className="space-y-5">
      {newHref && !readOnly && (
        <div className="flex justify-end">
          <Link
            href={newHref}
            className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            {type === "PAYABLE" ? "Adicionar conta a pagar" : "Adicionar conta a receber"}
          </Link>
        </div>
      )}

      {!hideTotals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <p className="text-xs text-muted-foreground">{type === "PAYABLE" ? "Vencido" : "Não recebido"}</p>
            <p className="text-lg font-bold text-danger-foreground">{formatBRL(totalizadores.vencido / 100)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <p className="text-xs text-muted-foreground">{type === "PAYABLE" ? "A pagar" : "A receber"}</p>
            <p className="text-lg font-bold text-foreground">{formatBRL(totalizadores.aVencer / 100)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <p className="text-xs text-muted-foreground">{type === "PAYABLE" ? "Pago" : "Recebido"}</p>
            <p className="text-lg font-bold text-success-foreground">{formatBRL(totalizadores.pago / 100)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-brand">{formatBRL(totalizadores.total / 100)}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface-raised divide-y divide-border-subtle">
        {isLoading ? (
          <Loading />
        ) : entries.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhum resultado." />
          </div>
        ) : (
          entries.map((entry) => {
            const paymentMethodName =
              entry.paymentMethod?.name ?? entry.expensePaymentMethod?.name ?? null;
            return (
              <div
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{entry.description}</p>
                    <StatusBadge tone={STATUS_TONE[entry.status]}>{STATUS_LABEL[entry.status]}</StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.category?.name ?? "Sem categoria"} · vencimento {formatDate(entry.dueDate)} ·{" "}
                    {formatBRL(entry.valueInCents / 100)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Filial: {entry.branch?.name ?? "—"} · Forma de pagamento: {paymentMethodName ?? "—"} ·
                    {" "}Conta bancária: {entry.bankAccount?.name ?? "—"} · Pago em:{" "}
                    {entry.paidAt ? `${formatDate(entry.paidAt)} ${formatTime(entry.paidAt)}` : "—"}
                  </p>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-2 shrink-0">
                    {entry.status !== "PAID" && entry.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() => markPaid(entry.id)}
                        title="Marcar como pago"
                        className="h-9 px-3 rounded-md border border-success-foreground/40 bg-transparent text-xs font-semibold text-success-foreground hover:bg-success/10 transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="size-3.5" />
                        Marcar pago
                      </button>
                    )}
                    {entry.status !== "PAID" && (
                      <button
                        type="button"
                        onClick={() => setToDelete(entry)}
                        className="size-9 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {!readOnly && (
        <ConfirmDialog
          open={toDelete !== null}
          onOpenChange={(v) => !v && setToDelete(null)}
          title="Remover lançamento?"
          description={toDelete ? `"${toDelete.description}" será removido.` : undefined}
          confirmLabel="Remover"
          tone="danger"
          onConfirm={() => toDelete && remove(toDelete.id)}
        />
      )}
    </div>
  );
}
