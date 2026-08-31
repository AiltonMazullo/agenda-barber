"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  DataTablePagination,
  EmptyState,
  ConfirmDialog,
  Loading,
  StatusBadge,
} from "@/components/shared";
import { useFinancialEntries } from "@/hooks/useFinancialEntries";
import { useFinancialBalance } from "@/hooks/useFinancialBalance";
import type { PageSize } from "@/hooks/usePagination";
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
  // spec-ajustes-escopo-2 §2.4: contas a pagar/receber não tinham paginação
  // nenhuma — agora busca só a página atual do servidor, em vez da lista
  // inteira fatiada no cliente (mesmo padrão já usado em `comandas`).
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const { entries, total, isLoading, markPaid, remove } = useFinancialEntries(
    barbershopId,
    { type, branchId, dueDateFrom, dueDateTo, search, categoryIds },
    { page, pageSize },
  );
  const [toDelete, setToDelete] = useState<FinancialEntry | null>(null);

  // Volta pra página 1 sempre que os filtros mudam — ajuste de estado
  // durante o render, senão a página atual pode ficar além do novo total.
  const filtersKey = `${type ?? ""}|${branchId ?? ""}|${dueDateFrom ?? ""}|${dueDateTo ?? ""}|${search ?? ""}|${(categoryIds ?? []).join(",")}`;
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const from = (total ?? 0) === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total ?? 0);

  function changePageSize(size: number) {
    setPageSize(size as PageSize);
    setPage(1);
  }

  // Totais calculados via endpoint de balanço (agregado no backend,
  // independente de paginação) em vez de somar `entries` — que agora só
  // contém a página atual, não a lista inteira.
  const { balance, refetch: refetchBalance } = useFinancialBalance(barbershopId, {
    branchId,
    dueDateFrom,
    dueDateTo,
    description: search,
    categoryIds,
  });
  const totalizadores =
    type === "PAYABLE"
      ? {
          vencido: balance.payable.overdue,
          aVencer: balance.payable.upcoming,
          pago: balance.payable.paid,
          total: balance.payable.total,
        }
      : {
          vencido: balance.receivable.notReceived,
          aVencer: balance.receivable.upcoming,
          pago: balance.receivable.received,
          total: balance.receivable.total,
        };

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
                    {/* spec-ajustes-escopo-2 §2.2: comanda fechada (contas a
                       receber) já nasce PAID automaticamente no fechamento —
                       "Marcar pago" manual só faz sentido pra contas a pagar. */}
                    {entry.type === "PAYABLE" &&
                      entry.status !== "PAID" &&
                      entry.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() => markPaid(entry.id).then(refetchBalance)}
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

      {!isLoading && entries.length > 0 && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          total={total ?? 0}
          from={from}
          to={to}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
          className="rounded-xl border border-border bg-surface-raised"
        />
      )}

      {!readOnly && (
        <ConfirmDialog
          open={toDelete !== null}
          onOpenChange={(v) => !v && setToDelete(null)}
          title="Remover lançamento?"
          description={toDelete ? `"${toDelete.description}" será removido.` : undefined}
          confirmLabel="Remover"
          tone="danger"
          onConfirm={() => toDelete && remove(toDelete.id).then(refetchBalance)}
        />
      )}
    </div>
  );
}
