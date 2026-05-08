/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared";
import { formatBRL, formatDate } from "@/utils/format";
import type { ComissaoPendente } from "@/types/financial.types";

interface GerarComissoesDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  comissoes: ComissaoPendente[];
  onConfirm: (ids: string[]) => number;
}

export function GerarComissoesDialog({
  open,
  onOpenChange,
  comissoes,
  onConfirm,
}: GerarComissoesDialogProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      // Por padrão seleciona todas
      setSelecionados(new Set(comissoes.map((c) => c.id)));
    }
  }, [open, comissoes]);

  function toggle(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selecionados.size === comissoes.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(comissoes.map((c) => c.id)));
    }
  }

  function handleConfirm() {
    const ids = Array.from(selecionados);
    if (ids.length === 0) {
      toast.error("Selecione pelo menos uma comissão.");
      return;
    }
    const count = onConfirm(ids);
    toast.success(`${count} comissão(ões) geradas em Contas a Pagar.`);
    onOpenChange(false);
  }

  const totalSelecionado = comissoes
    .filter((c) => selecionados.has(c.id))
    .reduce((acc, c) => acc + c.valorComissao, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                Gerar Comissões
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
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 scrollbar-thin">
          {comissoes.length === 0 ? (
            <EmptyState
              message="Nenhuma comissão pendente no período."
              icon={<RefreshCw className="size-10" />}
            />
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Selecione os profissionais para gerar lançamentos automáticos em
                Contas a Pagar (vencimento em 5 dias).
              </p>

              <button
                type="button"
                onClick={toggleAll}
                className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline"
              >
                {selecionados.size === comissoes.length
                  ? "Desmarcar todos"
                  : "Selecionar todos"}
              </button>

              {comissoes.map((c) => {
                const checked = selecionados.has(c.id);
                return (
                  <label
                    key={c.id}
                    htmlFor={c.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "bg-brand/5 border-brand/40"
                        : "bg-surface-base border-border hover:border-brand/30"
                    }`}
                  >
                    <Checkbox
                      id={c.id}
                      checked={checked}
                      onCheckedChange={() => toggle(c.id)}
                      className="border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-brand-foreground"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {c.profissionalNome}
                        </span>
                        <span className="text-sm font-bold text-success-foreground">
                          {formatBRL(c.valorComissao)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>
                          {c.servicosCount} serviços · {c.produtosCount} produtos
                        </span>
                        <span className="text-text-subtle">·</span>
                        <span>
                          Bruto: {formatBRL(c.totalBruto)} · taxa {c.taxa}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-text-subtle">
                        <Calendar className="size-2.5" />
                        {formatDate(c.periodoInicio)} →{" "}
                        {formatDate(c.periodoFim)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </>
          )}
        </div>

        {comissoes.length > 0 && (
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-raised shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">
                {selecionados.size} de {comissoes.length} selecionada(s)
              </span>
              <span className="text-base font-bold text-brand">
                {formatBRL(totalSelecionado)}
              </span>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selecionados.size === 0}
                className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gerar {selecionados.size > 0 && `(${selecionados.size})`}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
