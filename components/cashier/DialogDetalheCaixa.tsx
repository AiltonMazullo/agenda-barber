/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Trash2,
  Receipt,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loading } from "@/components/shared";
import { FormMovimentacao } from "./FormMovimentacao";
import { DialogFechamentoCaixa } from "./DialogFechamentoCaixa";
import { formatBRL, formatDate, formatTime } from "@/utils/format";
import {
  OPENING_TRANSACTION_NAME,
  PAYMENT_METHOD_LABELS,
  type CashRegister,
  type CashRegisterClosingSummary,
  type NewTransactionInput,
  type PaymentMethod,
} from "@/types/cash-register.types";

export function DialogDetalheCaixa({
  open,
  onOpenChange,
  register,
  loading,
  busy,
  onAddTransaction,
  onClose,
  onRemove,
  fetchClosingSummary,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  register: CashRegister | null;
  loading?: boolean;
  busy?: boolean;
  onAddTransaction: (input: NewTransactionInput) => void;
  onClose: (countedCashInCents?: number) => void;
  onRemove: () => void;
  /** Busca o dinheiro esperado + assinaturas manuais do dia (ver §2.2). */
  fetchClosingSummary?: () => Promise<CashRegisterClosingSummary | null>;
}) {
  const [confirmFechar, setConfirmFechar] = useState(false);
  const [closingSummary, setClosingSummary] =
    useState<CashRegisterClosingSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!confirmFechar || !fetchClosingSummary) return;
    let active = true;
    setLoadingSummary(true);
    fetchClosingSummary()
      .then((summary) => {
        if (active) setClosingSummary(summary);
      })
      .finally(() => {
        if (active) setLoadingSummary(false);
      });
    return () => {
      active = false;
    };
  }, [confirmFechar, fetchClosingSummary]);

  const aberto = register?.closedAt === null;
  const transactions = useMemo(() => register?.transactions ?? [], [register]);

  const { entradas, saidas, abertura } = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    let abertura = 0;
    for (const t of transactions) {
      if (t.name === OPENING_TRANSACTION_NAME && t.type === "ENTRY") {
        abertura = t.valueInCents;
      }
      if (t.type === "ENTRY") entradas += t.valueInCents;
      else saidas += t.valueInCents;
    }
    return { entradas, saidas, abertura };
  }, [transactions]);

  const saldo = entradas - saidas;

  function labelFor(t: { paymentMethod?: string | null }): string {
    if (!t.paymentMethod) return "";
    return PAYMENT_METHOD_LABELS[t.paymentMethod as PaymentMethod] ?? t.paymentMethod;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="size-4 text-brand shrink-0" />
                <DialogTitle className="text-base font-bold truncate">
                  {register?.branch?.name ?? "Caixa"}
                </DialogTitle>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                    aberto
                      ? "bg-success-bg text-success-foreground"
                      : "bg-surface-elevated text-muted-foreground"
                  }`}
                >
                  {aberto ? "Aberto" : "Fechado"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            {register && (
              <p className="text-xs text-muted-foreground mt-1">
                Aberto em {formatDate(register.createdAt)} às{" "}
                {formatTime(register.createdAt)}
                {register.closedAt &&
                  ` · Fechado em ${formatDate(register.closedAt)} às ${formatTime(register.closedAt)}`}
              </p>
            )}
          </DialogHeader>

          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <Loading />
            ) : (
              <>
                {/* Resumo com abertura */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-lg border border-border-subtle bg-surface-base p-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      Abertura
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatBRL(abertura / 100)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-base p-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      Entradas
                    </p>
                    <p className="text-sm font-bold text-success-foreground">
                      {formatBRL(entradas / 100)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-base p-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      Saídas
                    </p>
                    <p className="text-sm font-bold text-danger-foreground">
                      {formatBRL(saidas / 100)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-base p-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      Saldo
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatBRL(saldo / 100)}
                    </p>
                  </div>
                </div>

                {/* Form (apenas se aberto) */}
                {aberto && (
                  <FormMovimentacao onAdd={onAddTransaction} submitting={busy} />
                )}

                {/* Transações */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Movimentações ({transactions.length})
                  </p>
                  {transactions.length === 0 ? (
                    <p className="text-sm text-text-faint text-center py-6">
                      Nenhuma movimentação registrada.
                    </p>
                  ) : (
                    transactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-base p-3"
                      >
                        {t.type === "ENTRY" ? (
                          <ArrowDownCircle className="size-4 text-success-foreground shrink-0" />
                        ) : (
                          <ArrowUpCircle className="size-4 text-danger-foreground shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {t.name}
                          </p>
                          {t.paymentMethod && (
                            <p className="text-[11px] text-muted-foreground">
                              {labelFor(t)}
                            </p>
                          )}
                          {t.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {t.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-sm font-bold shrink-0 ${
                            t.type === "ENTRY"
                              ? "text-success-foreground"
                              : "text-danger-foreground"
                          }`}
                        >
                          {t.type === "ENTRY" ? "+" : "−"}
                          {formatBRL(t.valueInCents / 100)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-between gap-3">
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="h-9 px-4 rounded-md border border-danger/30 bg-danger/10 text-sm text-danger-foreground hover:bg-danger/20 transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              <Trash2 className="size-3.5" />
              Excluir
            </button>
            {aberto && (
              <button
                type="button"
                onClick={() => setConfirmFechar(true)}
                disabled={busy}
                className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                <Lock className="size-3.5" />
                Fechar caixa
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DialogFechamentoCaixa
        open={confirmFechar}
        onOpenChange={setConfirmFechar}
        branchName={register?.branch?.name ?? "Caixa"}
        transactions={transactions}
        summary={closingSummary}
        loadingSummary={loadingSummary}
        busy={busy}
        onConfirm={(countedCashInCents) => {
          setConfirmFechar(false);
          onClose(countedCashInCents);
        }}
      />
    </>
  );
}
