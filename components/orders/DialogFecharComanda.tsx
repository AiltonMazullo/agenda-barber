"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Wallet, X } from "lucide-react";
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
import { COMANDA_FORMA_PAGAMENTO_OPTIONS } from "@/utils/comanda";
import type { Comanda, ComandaFormaPagamento } from "@/types/orders.types";
import type { SelectOption } from "@/types/common.types";

/**
 * Confirmação de fechamento de comanda — se a filial da comanda tiver mais
 * de um caixa aberto, exige a escolha de qual caixa recebe o registro (ver
 * ajustes/Módulo Caixa.md); com um só, já vem selecionado; sem nenhum caixa
 * aberto (ou sem filial vinculada), o fechamento é bloqueado — o backend
 * exige um caixa aberto para registrar a venda.
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
  onConfirm: (
    cashRegisterId: string | undefined,
    formaPagamento: ComandaFormaPagamento,
  ) => Promise<unknown> | void;
}) {
  const { registers } = useCashRegisters(barbershopId);
  const [cashRegisterId, setCashRegisterId] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<ComandaFormaPagamento | "">("");
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
    setFormaPagamento("");
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

  const semCaixaDisponivel = !comanda?.branchId || openRegisters.length === 0;
  const precisaEscolherCaixa = comanda?.branchId && openRegisters.length > 1;
  const podeConfirmar =
    !semCaixaDisponivel &&
    (!precisaEscolherCaixa || cashRegisterId !== "") &&
    formaPagamento !== "";

  async function handleConfirmar() {
    if (!formaPagamento) return;
    setSubmitting(true);
    try {
      await onConfirm(cashRegisterId || undefined, formaPagamento);
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
            <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2.5">
              <AlertTriangle className="size-4 text-warning-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Esta comanda não está vinculada a uma filial. Vincule uma
                filial para poder fechá-la.
              </p>
            </div>
          ) : openRegisters.length === 0 ? (
            <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2.5">
              <AlertTriangle className="size-4 text-warning-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Nenhum caixa aberto nesta filial. É necessário abrir um caixa
                para finalizar a comanda.
              </p>
            </div>
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

          <LabeledSelect
            label="Forma de pagamento"
            required
            placeholder="Selecione..."
            value={formaPagamento}
            onValueChange={(v) => setFormaPagamento(v as ComandaFormaPagamento)}
            options={COMANDA_FORMA_PAGAMENTO_OPTIONS}
          />
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
