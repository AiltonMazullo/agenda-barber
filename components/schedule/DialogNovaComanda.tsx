"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Receipt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  SERVICOS,
  PROFISSIONAIS,
  type Agendamento,
} from "@/mock/schedule";
import { getDuracao, minToTime } from "@/utils/schedule.utils";

interface DialogNovaComandaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agendamentos: Agendamento[];
}

export function DialogNovaComanda({
  open,
  onOpenChange,
  agendamentos,
}: DialogNovaComandaProps) {
  const [agSelecionadoId, setAgSelecionadoId] = useState<string | null>(null);

  const handleGerar = () => {
    if (!agSelecionadoId) {
      toast.error("Selecione um agendamento para gerar a comanda.");
      return;
    }
    const ag = agendamentos.find((a) => a.id === agSelecionadoId)!;
    const servico = SERVICOS.find((s) => s.id === ag.servicoId)!;
    toast.success(
      `Comanda gerada para ${ag.cliente} — ${servico.nome} (R$ ${servico.preco.toFixed(2)})`,
    );
    onOpenChange(false);
    setAgSelecionadoId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-md p-0 gap-0">
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
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-3 max-h-80 overflow-y-auto">
          <p className="text-xs text-muted-foreground">
            Selecione o agendamento para criar uma comanda:
          </p>
          {agendamentos.length === 0 && (
            <p className="text-sm text-text-subtle text-center py-4">
              Nenhum agendamento disponível.
            </p>
          )}
          {agendamentos.map((ag) => {
            const s = SERVICOS.find((sv) => sv.id === ag.servicoId)!;
            const p = PROFISSIONAIS.find((pr) => pr.id === ag.profissionalId)!;
            const d = getDuracao(ag);
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => setAgSelecionadoId(ag.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  agSelecionadoId === ag.id
                    ? "border-[#f5b82e]/60 bg-[#f5b82e]/10"
                    : "border-border bg-surface-base hover:border-[#f5b82e]/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full shrink-0", s.cor)} />
                  <span className="text-sm font-semibold text-white">
                    {ag.cliente}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 ml-auto">
                    R$ {s.preco.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {s.nome}
                  </span>
                  <span className="text-[10px] text-text-subtle">·</span>
                  <span className="text-xs text-muted-foreground">
                    {p.nome}
                  </span>
                  <span className="text-[10px] text-text-subtle">·</span>
                  <span className="text-xs text-muted-foreground">
                    {minToTime(ag.inicioMin)} ({d}min)
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
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGerar}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors flex items-center gap-1.5"
          >
            <Receipt className="size-3.5" />
            Gerar Comanda
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
