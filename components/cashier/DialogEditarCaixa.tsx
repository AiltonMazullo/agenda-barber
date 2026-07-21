/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectField } from "@/components/shared";
import { toast } from "sonner";
import type { Branch } from "@/types/branch.types";
import type { CashRegister } from "@/types/cash-register.types";

interface DialogEditarCaixaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  register: CashRegister | null;
  branches: Branch[];
  busy?: boolean;
  onConfirm: (branchId: string) => void;
}

/**
 * Edição de metadados do caixa aberto (ver spec-correcoes-criticas.md §2.1).
 * Hoje só permite reatribuir a filial vinculada — `closedAt` nunca é editado
 * por aqui, isso é feito pelos fluxos de fechar/reabrir.
 */
export function DialogEditarCaixa({
  open,
  onOpenChange,
  register,
  branches,
  busy,
  onConfirm,
}: DialogEditarCaixaProps) {
  const [branchId, setBranchId] = useState("");

  useEffect(() => {
    if (open && register) {
      setBranchId(register.branchId);
    }
  }, [open, register]);

  const options = branches.map((b) => ({ value: b.id, label: b.name }));

  function handleConfirm() {
    if (!branchId) {
      toast.error("Selecione uma filial.");
      return;
    }
    onConfirm(branchId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-sm p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                Editar caixa
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

        <div className="px-6 py-5 space-y-4">
          <SelectField
            id="edit-branch"
            label="Filial"
            value={branchId}
            options={options}
            onChange={setBranchId}
            placeholder="Selecione a filial"
          />
          <p className="text-[11px] text-text-faint">
            Só é possível reatribuir a filial de um caixa ainda aberto. O
            fechamento e a reabertura são feitos pelos botões próprios.
          </p>
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
            onClick={handleConfirm}
            disabled={busy}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {busy ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
