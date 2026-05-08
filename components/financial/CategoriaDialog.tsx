/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CategoriaFinanceira, ContaTipo } from "@/types/financial.types";

interface CategoriaDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (dados: Omit<CategoriaFinanceira, "id">) => void;
}

export function CategoriaDialog({
  open,
  onOpenChange,
  onSave,
}: CategoriaDialogProps) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<ContaTipo>("pagar");

  useEffect(() => {
    if (open) {
      setNome("");
      setTipo("pagar");
    }
  }, [open]);

  function handleSave() {
    const limpo = nome.trim();
    if (!limpo) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    onSave({ nome: limpo, tipo });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-sm p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Nova Categoria
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Nome
            </label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Marketing, Manutenção..."
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipo("pagar")}
                className={`h-10 rounded-md border text-xs font-semibold transition-colors ${
                  tipo === "pagar"
                    ? "bg-danger/15 border-danger/50 text-danger-foreground"
                    : "border-border bg-surface-base text-muted-foreground hover:border-brand/40"
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setTipo("receber")}
                className={`h-10 rounded-md border text-xs font-semibold transition-colors ${
                  tipo === "receber"
                    ? "bg-success/15 border-success/50 text-success-foreground"
                    : "border-border bg-surface-base text-muted-foreground hover:border-brand/40"
                }`}
              >
                Receita
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            Criar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
