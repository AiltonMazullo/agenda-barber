"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Wallet, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LabeledSelect } from "./FormField";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { formatDate, formatTime } from "@/utils/format";
import type { Comanda } from "@/types/orders.types";
import type { SelectOption } from "@/types/common.types";

/**
 * Confirmação de fechamento de comanda — se a filial da comanda tiver mais
 * de um caixa aberto, exige a escolha de qual caixa recebe o registro (ver
 * ajustes/Módulo Caixa.md); com um só, já vem selecionado; sem nenhum, fecha
 * sem vínculo (comportamento anterior, para quem não usa o módulo de caixa).
 */
export function DialogFecharComanda({
  open,
  onOpenChange,
  barbershopId,
  comanda,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barbershopId: string | undefined;
  comanda: Comanda | null;
  onConfirm: (cashRegisterId?: string) => Promise<unknown> | void;
}) {
  const { registers } = useCashRegisters(barbershopId);
  const [cashRegisterId, setCashRegisterId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openRegisters = useMemo(
    () =>
      registers.filter(
        (r) => r.closedAt === null && r.branchId === comanda?.branchId,
      ),
    [registers, comanda?.branchId],
  );

  useEffect(() => {
    if (!open) return;
    setCashRegisterId(openRegisters.length === 1 ? openRegisters[0].id : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openRegisters.length]);

  const registerOptions = useMemo<SelectOption<string>[]>(
    () =>
      openRegisters.map((r) => ({
        value: r.id,
        label: `${r.branch.name} · aberto em ${formatDate(r.createdAt, { day: "2-digit", month: "2-digit" })} ${formatTime(r.createdAt)}`,
      })),
    [openRegisters],
  );

  const precisaEscolher = comanda?.branchId && openRegisters.length > 1;
  const podeConfirmar = !precisaEscolher || cashRegisterId !== "";

  async function handleConfirmar() {
    setSubmitting(true);
    try {
      await onConfirm(cashRegisterId || undefined);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                Fechar comanda{comanda ? ` #${comanda.numero}` : ""}
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
          {!comanda?.branchId ? (
            <p className="text-sm text-muted-foreground">
              Esta comanda não está vinculada a uma filial — será fechada sem
              vínculo com nenhum caixa.
            </p>
          ) : openRegisters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum caixa aberto nesta filial. A comanda será fechada sem
              vínculo com nenhum caixa.
            </p>
          ) : openRegisters.length === 1 ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-base px-3 py-2.5 text-sm text-foreground">
              <Wallet className="size-4 text-brand shrink-0" />
              {registerOptions[0]?.label}
            </div>
          ) : (
            <LabeledSelect
              label="Caixa"
              required
              placeholder="Selecione o caixa..."
              value={cashRegisterId}
              onValueChange={setCashRegisterId}
              options={registerOptions}
            />
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <Button
            type="button"
            onClick={() => void handleConfirmar()}
            disabled={!podeConfirmar || submitting}
            className="h-9 px-5 cursor-pointer bg-brand text-brand-foreground font-bold hover:bg-brand-hover disabled:cursor-not-allowed"
          >
            {submitting ? "Fechando…" : "Fechar comanda"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
