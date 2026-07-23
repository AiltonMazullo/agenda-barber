/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Trash2, Receipt, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loading } from "@/components/shared";
import { FormMovimentacao } from "./FormMovimentacao";
import { DialogFechamentoCaixa } from "./DialogFechamentoCaixa";
import { formatBRL, formatDate, formatTime } from "@/utils/format";
import {
  OPENING_TRANSACTION_NAME,
  type CashRegister,
  type CashRegisterClosingSummary,
  type NewTransactionInput,
} from "@/types/cash-register.types";

/** Forma de pagamento de Comanda usa um enum diferente do de CashTransaction. */
const COMANDA_PAGAMENTO_LABELS: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  CREDITO: "Cartão de Crédito",
  DEBITO: "Cartão de Débito",
  PIX: "PIX",
  OUTRO: "Outro",
};

/** Uma linha da tabela de movimentações — de uma comanda fechada ou de um lançamento manual. */
interface MovimentoRow {
  key: string;
  comanda: string;
  cliente: string;
  profissional: string;
  horario: string | null;
  totalInCents: number;
  pagamento: string;
}

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
  const comandas = useMemo(() => register?.comandas ?? [], [register]);

  const abertura = useMemo(() => {
    const t = transactions.find(
      (t) => t.name === OPENING_TRANSACTION_NAME && t.type === "ENTRY",
    );
    return t?.valueInCents ?? 0;
  }, [transactions]);

  const movimentos = useMemo<MovimentoRow[]>(() => {
    const daComandas: MovimentoRow[] = comandas.map((c) => ({
      key: `comanda-${c.numero}`,
      comanda: `#${c.numero}`,
      cliente: c.cliente ?? "—",
      profissional: c.profissional ?? "—",
      horario: c.horario,
      totalInCents: c.totalInCents,
      pagamento: c.formaPagamento
        ? (COMANDA_PAGAMENTO_LABELS[c.formaPagamento] ?? c.formaPagamento)
        : "—",
    }));

    const manuais: MovimentoRow[] = transactions
      .filter((t) => t.name !== OPENING_TRANSACTION_NAME)
      .map((t) => ({
        key: `transacao-${t.id}`,
        comanda: "—",
        cliente: "—",
        profissional: "—",
        horario: t.createdAt,
        totalInCents: t.type === "ENTRY" ? t.valueInCents : -t.valueInCents,
        pagamento: t.type === "ENTRY" ? "Entrada manual" : "Saída manual",
      }));

    return [...daComandas, ...manuais].sort((a, b) =>
      (a.horario ?? "").localeCompare(b.horario ?? ""),
    );
  }, [comandas, transactions]);

  const totalInCents = useMemo(
    () => movimentos.reduce((sum, m) => sum + m.totalInCents, 0),
    [movimentos],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-raised border border-border text-foreground max-w-3xl p-0 gap-0">
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

          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {loading ? (
              <Loading />
            ) : (
              <>
                {/* Faixa com Valor Inicial e Total, ver ajustes/Módulo Caixa.md */}
                <div className="flex items-center justify-between gap-4 rounded-lg bg-foreground px-4 py-3 text-background">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-background/60">
                      Valor Inicial
                    </p>
                    <p className="text-sm font-bold">
                      {formatBRL(abertura / 100)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-background/60">
                      Total
                    </p>
                    <p className="text-lg font-bold">
                      {formatBRL(totalInCents / 100)}
                    </p>
                  </div>
                </div>

                {/* Form (apenas se aberto) */}
                {aberto && (
                  <FormMovimentacao onAdd={onAddTransaction} submitting={busy} />
                )}

                {/* Movimentações: comandas fechadas + lançamentos manuais */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {movimentos.length}{" "}
                    {movimentos.length === 1 ? "registro" : "registros"}
                  </p>
                  {movimentos.length === 0 ? (
                    <p className="text-sm text-text-faint text-center py-6">
                      Nenhuma movimentação registrada.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-border-subtle">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border-subtle hover:bg-transparent">
                            <TableHead>Comanda</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Pagamento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movimentos.map((m) => (
                            <TableRow key={m.key} className="border-border-subtle">
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {m.comanda}
                              </TableCell>
                              <TableCell>{m.cliente}</TableCell>
                              <TableCell>{m.profissional}</TableCell>
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {m.horario
                                  ? `${formatDate(m.horario)} ${formatTime(m.horario)}`
                                  : "—"}
                              </TableCell>
                              <TableCell
                                className={`font-semibold ${m.totalInCents < 0 ? "text-danger-foreground" : "text-foreground"}`}
                              >
                                {formatBRL(m.totalInCents / 100)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {m.pagamento}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
