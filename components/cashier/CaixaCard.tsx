"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Clock,
  ChevronDown,
  TrendingUp,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { Loading } from "@/components/shared";
import { formatDate, formatTime, formatBRL } from "@/utils/format";
import { OPENING_TRANSACTION_NAME } from "@/types/cash-register.types";
import { cn } from "@/lib/utils";
import type { CashRegister } from "@/types/cash-register.types";

/**
 * Mesma soma usada no detalhe do caixa (DialogDetalheCaixa): "Total" precisa
 * incluir as comandas vinculadas, senão os dois lugares mostram números
 * diferentes pro mesmo caixa (movimentações manuais isoladas != total real).
 */
function computeSummary(register: CashRegister) {
  const txs = register.transactions;
  if (!txs) return null;

  let abertura = 0;
  let entradas = 0;
  let saidas = 0;
  for (const t of txs) {
    if (t.name === OPENING_TRANSACTION_NAME && t.type === "ENTRY") {
      abertura = t.valueInCents;
    }
    if (t.type === "ENTRY") entradas += t.valueInCents;
    else saidas += t.valueInCents;
  }
  const comandasTotal = (register.comandas ?? []).reduce(
    (sum, c) => sum + c.totalInCents,
    0,
  );
  return { abertura, entradas, total: entradas - saidas + comandasTotal };
}

export function CaixaCard({
  register,
  onClick,
  onExpand,
  onEdit,
  onReopen,
}: {
  register: CashRegister;
  /** Abre o detalhe completo (dialog). */
  onClick: () => void;
  /** Carrega as transações sob demanda quando o resumo é expandido. */
  onExpand?: () => void;
  /** Abre o formulário de edição de metadados (só exibido em caixas abertos). */
  onEdit?: () => void;
  /** Reabre um caixa fechado (só exibido em caixas fechados). */
  onReopen?: () => void;
}) {
  const aberto = register.closedAt === null;
  const summary = computeSummary(register);
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    // Lazy-load das transações na primeira expansão.
    if (next && !register.transactions && onExpand) onExpand();
  }

  return (
    <div className="rounded-lg border border-border bg-surface-raised hover:border-brand/40 transition-colors">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={onClick}
          className="group flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div className="size-10 rounded-lg bg-brand/15 text-brand grid place-items-center shrink-0">
            <Building2 className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate group-hover:text-brand transition-colors">
              {register.branch?.name ?? "Filial"}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Clock className="size-3" />
              <span>
                Aberto em {formatDate(register.createdAt)} às{" "}
                {formatTime(register.createdAt)}
              </span>
            </div>
            {register.closedAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>
                  Fechado em {formatDate(register.closedAt)} às{" "}
                  {formatTime(register.closedAt)}
                </span>
              </div>
            )}
          </div>
        </button>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
            aberto
              ? "bg-success-bg text-success-foreground"
              : "bg-surface-elevated text-muted-foreground"
          }`}
        >
          {aberto ? "Aberto" : "Fechado"}
        </span>

        {aberto && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar caixa"
            className="size-7 rounded-md grid place-items-center text-text-faint hover:text-brand hover:bg-surface-elevated transition-colors shrink-0"
          >
            <Pencil className="size-3.5" />
          </button>
        )}

        {!aberto && onReopen && (
          <button
            type="button"
            onClick={onReopen}
            aria-label="Reabrir caixa"
            className="size-7 rounded-md grid place-items-center text-text-faint hover:text-brand hover:bg-surface-elevated transition-colors shrink-0"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={toggle}
          aria-label={expanded ? "Recolher resumo" : "Expandir resumo"}
          aria-expanded={expanded}
          className="size-7 rounded-md grid place-items-center text-text-faint hover:text-brand hover:bg-surface-elevated transition-colors shrink-0"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="resumo"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {summary ? (
                <div className="pt-3 border-t border-border-subtle grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      Abertura
                    </p>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {formatBRL(summary.abertura / 100)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      Entradas
                    </p>
                    <p className="text-xs font-bold text-success-foreground mt-0.5 flex items-center justify-center gap-0.5">
                      <TrendingUp className="size-3" />
                      {formatBRL(summary.entradas / 100)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      Total
                    </p>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {formatBRL(summary.total / 100)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-border-subtle">
                  <Loading label="Carregando resumo" size={20} className="py-2" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
