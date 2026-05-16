"use client";

import { X, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface DadosMudancaDuracao {
  profAnterior: string;
  profNovo: string;
  duracaoAntes: number;
  duracaoDepois: number;
  servico: string;
}

interface DialogMudancaDuracaoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dados: DadosMudancaDuracao | null;
  onConfirm: () => void;
}

export function DialogMudancaDuracao({
  open,
  onOpenChange,
  dados,
  onConfirm,
}: DialogMudancaDuracaoProps) {
  if (!dados) return null;
  const diff = dados.duracaoDepois - dados.duracaoAntes;
  const aumentou = diff > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-sm p-0 gap-0">
        <div
          className={cn(
            "h-1 w-full rounded-t-lg",
            aumentou ? "bg-amber-500" : "bg-emerald-500",
          )}
        />
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={cn(
                  "size-4",
                  aumentou ? "text-amber-400" : "text-emerald-400",
                )}
              />
              <DialogTitle className="text-base font-bold">
                Duração diferente
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
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ao transferir{" "}
            <span className="text-white font-semibold">{dados.servico}</span>{" "}
            para{" "}
            <span className="text-white font-semibold">{dados.profNovo}</span>,
            o tempo será{" "}
            <span
              className={cn(
                "font-bold",
                aumentou ? "text-amber-400" : "text-emerald-400",
              )}
            >
              {aumentou
                ? `${Math.abs(diff)}min a mais`
                : `${Math.abs(diff)}min a menos`}
            </span>{" "}
            que com{" "}
            <span className="text-white font-semibold">
              {dados.profAnterior}
            </span>
            .
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-base border border-border rounded-lg p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-subtle mb-1">
                {dados.profAnterior}
              </p>
              <p className="text-xl font-bold text-white">
                {dados.duracaoAntes}
                <span className="text-xs text-text-subtle ml-0.5">min</span>
              </p>
            </div>
            <div
              className={cn(
                "border rounded-lg p-3 text-center",
                aumentou
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30",
              )}
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-subtle mb-1">
                {dados.profNovo}
              </p>
              <p
                className={cn(
                  "text-xl font-bold",
                  aumentou ? "text-amber-400" : "text-emerald-400",
                )}
              >
                {dados.duracaoDepois}
                <span className="text-xs ml-0.5 opacity-60">min</span>
              </p>
            </div>
          </div>
          <p className="text-[11px] text-text-subtle">
            O card será redimensionado automaticamente.
          </p>
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
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors"
          >
            Confirmar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
