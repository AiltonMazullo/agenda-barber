"use client";

import { X, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SERVICOS, type Agendamento } from "@/mock/schedule";
import { getDuracao, minToTime } from "@/utils/schedule.utils";

export interface DadosConflito {
  agMovendo: Agendamento;
  conflitantes: Agendamento[];
  novoInicio: number;
  novoProfId: string;
}

interface DialogConflitoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dados: DadosConflito | null;
  onConfirm: () => void;
}

export function DialogConflito({
  open,
  onOpenChange,
  dados,
  onConfirm,
}: DialogConflitoProps) {
  if (!dados) return null;
  const servMovendo = SERVICOS.find((s) => s.id === dados.agMovendo.servicoId)!;
  const durMovendo = getDuracao(dados.agMovendo, dados.novoProfId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-md p-0 gap-0">
        <div className="h-1 w-full rounded-t-lg bg-red-500" />
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-400" />
              <DialogTitle className="text-base font-bold">
                Conflito de Horário
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

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            O agendamento abaixo conflita com{" "}
            <span className="text-white font-semibold">
              {dados.conflitantes.length} agendamento
              {dados.conflitantes.length > 1 ? "s" : ""}
            </span>{" "}
            existente{dados.conflitantes.length > 1 ? "s" : ""}. Deseja sobrepor
            mesmo assim?
          </p>

          <div className="rounded-lg border border-[#f5b82e]/40 bg-[#f5b82e]/5 p-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-brand mb-2">
              Movendo
            </p>
            <div className="flex items-center gap-2">
              <span
                className={cn("size-2 rounded-full shrink-0", servMovendo.cor)}
              />
              <span className="text-sm font-semibold text-white">
                {dados.agMovendo.cliente}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {minToTime(dados.novoInicio)} –{" "}
                {minToTime(dados.novoInicio + durMovendo)}
              </span>
            </div>
            <p className="text-xs text-text-subtle mt-1">
              {servMovendo.nome} · {durMovendo}min
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">
              Conflito com
            </p>
            {dados.conflitantes.map((c) => {
              const s = SERVICOS.find((sv) => sv.id === c.servicoId)!;
              const d = getDuracao(c);
              return (
                <div
                  key={c.id}
                  className="rounded-lg border border-red-500/30 bg-red-500/5 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("size-2 rounded-full shrink-0", s.cor)}
                    />
                    <span className="text-sm font-semibold text-white">
                      {c.cliente}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {minToTime(c.inicioMin)} – {minToTime(c.inicioMin + d)}
                    </span>
                  </div>
                  <p className="text-xs text-text-subtle mt-1">
                    {s.nome} · {d}min
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-500/5 border border-red-500/20">
            <AlertTriangle className="size-3.5 text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300/80">
              Sobrepor agendamentos pode prejudicar a qualidade do atendimento.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="h-9 px-5 rounded-md text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Sobrepor mesmo assim
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
