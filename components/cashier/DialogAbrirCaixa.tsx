/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { X, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectField } from "@/components/shared";
import { toast } from "sonner";
import type { Branch } from "@/types/branch.types";

export function DialogAbrirCaixa({
  open,
  onOpenChange,
  branches,
  onConfirm,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  branches: Branch[];
  onConfirm: (branchId: string) => void;
  submitting?: boolean;
}) {
  const [branchId, setBranchId] = useState("");

  useEffect(() => {
    if (open) setBranchId(branches[0]?.id ?? "");
  }, [open, branches]);

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
              <Wallet className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                Abrir caixa
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
          {branches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma filial cadastrada. Cadastre uma filial em Configurações
              antes de abrir um caixa.
            </p>
          ) : (
            <SelectField
              id="branch"
              label="Filial"
              value={branchId}
              options={options}
              onChange={setBranchId}
              placeholder="Selecione a filial"
            />
          )}
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
            disabled={submitting || branches.length === 0}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {submitting ? "Abrindo…" : "Abrir caixa"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
