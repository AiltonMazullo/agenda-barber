/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Lock, AlertTriangle, Banknote, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBRL, maskBRLInput, parseBRL } from "@/utils/format";
import { COMANDA_FORMA_PAGAMENTO_LABELS } from "@/utils/comanda";
import {
  PAYMENT_METHOD_LABELS,
  OPENING_TRANSACTION_NAME,
  type CashRegisterClosingSummary,
  type CashTransaction,
  type ComandaMovimento,
  type PaymentMethod,
} from "@/types/cash-register.types";
import type { ComandaFormaPagamento } from "@/types/orders.types";

interface DialogFechamentoCaixaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  branchName: string;
  transactions: CashTransaction[];
  comandas?: ComandaMovimento[];
  /** Dinheiro esperado + assinaturas manuais do dia (ver §2.2). `null` enquanto carrega. */
  summary?: CashRegisterClosingSummary | null;
  loadingSummary?: boolean;
  busy?: boolean;
  onConfirm: (countedCashInCents?: number, divergenceReasonNote?: string) => void;
}

export function DialogFechamentoCaixa({
  open,
  onOpenChange,
  branchName,
  transactions,
  comandas = [],
  summary,
  loadingSummary,
  busy,
  onConfirm,
}: DialogFechamentoCaixaProps) {
  const [contado, setContado] = useState("");
  const [motivoDivergencia, setMotivoDivergencia] = useState("");

  useEffect(() => {
    if (open) {
      setContado("");
      setMotivoDivergencia("");
    }
  }, [open]);

  const countedCashInCents =
    contado.trim() === "" ? undefined : Math.round(parseBRL(contado) * 100);

  const cashDifferenceInCents =
    summary && countedCashInCents !== undefined
      ? countedCashInCents - summary.expectedCashInCents
      : null;
  /** Agrupa entradas por meio de pagamento — transações manuais + comandas fechadas (ignora a transação de abertura). */
  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "ENTRY") continue;
      if (t.name === OPENING_TRANSACTION_NAME) continue;
      const key: string = t.paymentMethod ?? "SEM_CLASSIFICACAO";
      map.set(key, (map.get(key) ?? 0) + t.valueInCents);
    }
    for (const c of comandas) {
      const key: string = c.formaPagamento ?? "SEM_CLASSIFICACAO";
      map.set(key, (map.get(key) ?? 0) + c.totalInCents);
    }
    return map;
  }, [transactions, comandas]);

  const { totalEntradas, saldoFinal, abertura } = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;
    let abertura = 0;
    for (const t of transactions) {
      if (t.name === OPENING_TRANSACTION_NAME && t.type === "ENTRY") {
        abertura = t.valueInCents;
        totalEntradas += t.valueInCents;
      } else if (t.type === "ENTRY") {
        totalEntradas += t.valueInCents;
      } else {
        totalSaidas += t.valueInCents;
      }
    }
    for (const c of comandas) {
      totalEntradas += c.totalInCents;
    }
    return { totalEntradas, saldoFinal: totalEntradas - totalSaidas, abertura };
  }, [transactions, comandas]);

  const paymentRows = Array.from(byPayment.entries()).sort((a, b) =>
    b[1] - a[1],
  );

  /** Saídas em dinheiro lançadas manualmente no caixa (ex.: retirada, troco, despesa avulsa). */
  const withdrawals = useMemo(
    () => transactions.filter((t) => t.type !== "ENTRY"),
    [transactions],
  );
  const totalSaidas = withdrawals.reduce((sum, t) => sum + t.valueInCents, 0);

  function labelFor(key: string): string {
    if (key === "SEM_CLASSIFICACAO") return "Sem classificação";
    return (
      PAYMENT_METHOD_LABELS[key as PaymentMethod] ??
      COMANDA_FORMA_PAGAMENTO_LABELS[key as ComandaFormaPagamento] ??
      key
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                Fechar caixa — {branchName}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Confira os valores antes de confirmar o fechamento.
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Totais */}
          <div className="grid grid-cols-3 gap-2">
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
                {formatBRL(totalEntradas / 100)}
              </p>
            </div>
            <div className="rounded-lg border border-success-foreground/30 bg-success-bg p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Saldo
              </p>
              <p className="text-sm font-bold text-success-foreground">
                {formatBRL(saldoFinal / 100)}
              </p>
            </div>
          </div>

          {/* Por meio de pagamento */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Entradas por meio de pagamento
            </p>
            {paymentRows.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                <AlertTriangle className="size-4 text-warning-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Nenhuma entrada classificada por meio de pagamento.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {paymentRows.map(([key, cents]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-base px-3 py-2"
                  >
                    <span className="text-sm text-foreground">
                      {labelFor(key)}
                    </span>
                    <span className="text-sm font-bold text-success-foreground">
                      {formatBRL(cents / 100)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-3 py-2">
                  <span className="text-sm font-bold text-foreground">
                    Total (entradas classificadas)
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {formatBRL(
                      Array.from(byPayment.values()).reduce(
                        (a, b) => a + b,
                        0,
                      ) / 100,
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Saídas em dinheiro */}
          {withdrawals.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-danger-foreground">
                Saídas
              </p>
              <div className="space-y-1.5">
                {withdrawals.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-base px-3 py-2"
                  >
                    <span className="text-sm text-foreground">
                      {t.name}
                      {t.description ? ` — ${t.description}` : ""}
                    </span>
                    <span className="text-sm font-bold text-danger-foreground">
                      -{formatBRL(t.valueInCents / 100)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-3 py-2">
                  <span className="text-sm font-bold text-foreground">
                    Total de saídas
                  </span>
                  <span className="text-sm font-bold text-danger-foreground">
                    -{formatBRL(totalSaidas / 100)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Assinaturas manuais do dia */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand flex items-center gap-1.5">
              <Users className="size-3" />
              Assinaturas Manuais
            </p>
            <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-base px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Cobranças manuais (não-gateway) pagas hoje
              </span>
              <span className="text-sm font-bold text-foreground">
                {loadingSummary
                  ? "…"
                  : formatBRL((summary?.manualSubscriptionsInCents ?? 0) / 100)}
              </span>
            </div>
          </div>

          {/* Contagem física de dinheiro */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand flex items-center gap-1.5">
              <Banknote className="size-3" />
              Contagem física do dinheiro
            </p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Dinheiro contado na gaveta
              </label>
              <Input
                value={contado}
                onChange={(e) => setContado(maskBRLInput(e.target.value))}
                placeholder="R$ 0,00"
                inputMode="numeric"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint h-10"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-base px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Dinheiro esperado
              </span>
              <span className="text-sm font-bold text-foreground">
                {loadingSummary
                  ? "…"
                  : formatBRL((summary?.expectedCashInCents ?? 0) / 100)}
              </span>
            </div>

            {cashDifferenceInCents !== null && (
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2",
                  cashDifferenceInCents === 0
                    ? "border-success-foreground/30 bg-success-bg"
                    : "border-danger-foreground/30 bg-danger-bg",
                )}
              >
                <span className="text-xs font-semibold text-foreground">
                  Diferença de caixa
                </span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    cashDifferenceInCents === 0
                      ? "text-success-foreground"
                      : "text-danger-foreground",
                  )}
                >
                  {cashDifferenceInCents > 0 ? "+" : ""}
                  {formatBRL(cashDifferenceInCents / 100)}
                </span>
              </div>
            )}

            {cashDifferenceInCents !== null && cashDifferenceInCents !== 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-danger-foreground">
                  Motivo da divergência *
                </label>
                <textarea
                  value={motivoDivergencia}
                  onChange={(e) => setMotivoDivergencia(e.target.value)}
                  placeholder="Explique a diferença encontrada na contagem…"
                  rows={2}
                  className="w-full rounded-md bg-surface-base border border-border text-foreground placeholder:text-text-faint text-sm p-2.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-foreground/30"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle className="size-4 text-warning-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Esta ação não pode ser desfeita. O caixa será fechado e irá para o
              histórico.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(countedCashInCents, motivoDivergencia.trim() || undefined)}
            disabled={
              busy ||
              (cashDifferenceInCents !== null &&
                cashDifferenceInCents !== 0 &&
                !motivoDivergencia.trim())
            }
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-60"
          >
            <Lock className="size-3.5" />
            {busy ? "Fechando…" : "Confirmar fechamento"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
