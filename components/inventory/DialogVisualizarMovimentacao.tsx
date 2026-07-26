"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared";
import { formatDate, formatTime } from "@/utils/format";
import type { StockMovement } from "@/types/inventory.types";
import { FormLabel } from "./FormLabel";
import { MOVEMENT_LABEL, MOVEMENT_TONE, formatBRLFromCents } from "./helpers";

/** Valor unitário relevante por tipo (custo na entrada, preço na venda). */
function unitValueCents(m: StockMovement): number | null {
  if (m.type === "ENTRADA") return m.unitCostInCents ?? null;
  if (m.type === "VENDA") return m.unitPriceInCents ?? null;
  return null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <FormLabel>{label}</FormLabel>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

/** Dialog somente-leitura com todos os detalhes de uma movimentação de estoque. */
export function DialogVisualizarMovimentacao({
  open,
  onOpenChange,
  movement,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  movement: StockMovement | null;
}) {
  if (!movement) return null;
  const unit = unitValueCents(movement);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Detalhes da Movimentação
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

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Row label="ID">
            <span className="font-mono text-xs">{movement.id}</span>
          </Row>
          <Row label="Tipo">
            <StatusBadge tone={MOVEMENT_TONE[movement.type]}>
              {MOVEMENT_LABEL[movement.type]}
            </StatusBadge>
          </Row>
          <Row label="Produto">{movement.productName}</Row>
          <Row label="Filial">{movement.branchName || "—"}</Row>
          <Row label="Quantidade">{movement.quantity}</Row>
          <Row label={movement.type === "VENDA" ? "Preço unitário" : "Custo unitário"}>
            {unit != null ? formatBRLFromCents(unit) : "—"}
          </Row>
          {unit != null && (
            <Row label="Total">{formatBRLFromCents(unit * movement.quantity)}</Row>
          )}
          <Row label="Observação">{movement.note || "—"}</Row>
          <Row label="Usuário">{movement.user}</Row>
          <Row label="Data/Hora">
            {formatDate(movement.createdAt)} · {formatTime(movement.createdAt)}
          </Row>
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
