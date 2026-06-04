"use client";

import { useEffect, useState } from "react";
import { X, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared";
import { toast } from "sonner";
import { maskBRLInput, parseBRL } from "@/utils/format";
import type { Branch } from "@/types/branch.types";

interface DialogAbrirCaixaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Todas as filiais cadastradas. */
  branches: Branch[];
  /** IDs de filiais que já têm caixa aberto (não disponíveis). */
  openBranchIds: string[];
  onConfirm: (branchId: string, openingCashInCents: number) => void;
  submitting?: boolean;
}

export function DialogAbrirCaixa({
  open,
  onOpenChange,
  branches,
  openBranchIds,
  onConfirm,
  submitting,
}: DialogAbrirCaixaProps) {
  const available = branches.filter((b) => !openBranchIds.includes(b.id));

  const [branchId, setBranchId] = useState("");
  const [especie, setEspecie] = useState("");

  useEffect(() => {
    if (open) {
      setBranchId(available[0]?.id ?? "");
      setEspecie("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const options = available.map((b) => ({ value: b.id, label: b.name }));

  function handleConfirm() {
    if (!branchId) {
      toast.error("Selecione uma filial.");
      return;
    }
    const openingCashInCents = especie
      ? Math.round(parseBRL(especie) * 100)
      : 0;
    onConfirm(branchId, openingCashInCents);
  }

  const noBranches = branches.length === 0;
  const noAvailable = !noBranches && available.length === 0;

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
          {noBranches ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma filial cadastrada. Cadastre uma filial em Configurações
              antes de abrir um caixa.
            </p>
          ) : noAvailable ? (
            <p className="text-sm text-muted-foreground">
              Todas as filiais já têm um caixa aberto. Feche um caixa antes de
              abrir outro.
            </p>
          ) : (
            <>
              <SelectField
                id="branch"
                label="Filial"
                value={branchId}
                options={options}
                onChange={setBranchId}
                placeholder="Selecione a filial"
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Valor em espécie no caixa (opcional)
                </label>
                <Input
                  value={especie}
                  onChange={(e) => setEspecie(maskBRLInput(e.target.value))}
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                  className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
                />
                <p className="text-[11px] text-text-faint">
                  Informe o troco/saldo em dinheiro já presente no caixa ao
                  abrir.
                </p>
              </div>
            </>
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
            disabled={submitting || noBranches || noAvailable}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {submitting ? "Abrindo…" : "Abrir caixa"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
