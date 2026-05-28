"use client";

import { useState } from "react";
import { X, Receipt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { minToTime } from "./helpers";
import type { AgendamentoVM, ProfissionalVM, ServicoVM } from "./types";

export function DialogNovaComanda({
  open,
  onOpenChange,
  agendamentos,
  servicoById,
  profById,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agendamentos: AgendamentoVM[];
  servicoById: Map<string, ServicoVM>;
  profById: Map<string, ProfissionalVM>;
}) {
  const [agSelecionadoId, setAgSelecionadoId] = useState<string | null>(null);

  const handleGerar = () => {
    if (!agSelecionadoId) {
      toast.error("Selecione um agendamento para gerar a comanda.");
      return;
    }
    const ag = agendamentos.find((a) => a.id === agSelecionadoId);
    const servico = ag ? servicoById.get(ag.servicoId) : undefined;
    if (ag && servico) {
      toast.success(
        `Comanda gerada para ${ag.cliente} — ${servico.nome} (R$ ${servico.preco.toFixed(2)})`,
      );
    }
    onOpenChange(false);
    setAgSelecionadoId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                Nova Comanda
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
        <div className="px-6 py-5 space-y-3 max-h-80 overflow-y-auto schedule-scroll">
          <p className="text-xs text-muted-foreground">
            Selecione o agendamento para criar uma comanda:
          </p>
          {agendamentos.length === 0 && (
            <p className="text-sm text-text-faint text-center py-4">
              Nenhum agendamento disponível.
            </p>
          )}
          {agendamentos.map((ag) => {
            const s = servicoById.get(ag.servicoId);
            const p = profById.get(ag.profissionalId);
            if (!s) return null;
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => setAgSelecionadoId(ag.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  agSelecionadoId === ag.id
                    ? "border-brand/60 bg-brand/10"
                    : "border-border bg-surface-base hover:border-brand/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.cor }}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {ag.cliente}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 ml-auto">
                    R$ {s.preco.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{s.nome}</span>
                  <span className="text-[10px] text-text-faint">·</span>
                  <span className="text-xs text-muted-foreground">
                    {p?.nome ?? "—"}
                  </span>
                  <span className="text-[10px] text-text-faint">·</span>
                  <span className="text-xs text-muted-foreground">
                    {minToTime(ag.inicioMin)} ({ag.duracao}min)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGerar}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <Receipt className="size-3.5" />
            Gerar Comanda
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
