"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { maskBRLInput } from "@/utils/format";
import type { ProductWithStock } from "@/hooks/useProducts";
import type { Branch } from "@/types/branch.types";
import type {
  NewStockMovementInput,
  StockMovementType,
} from "@/types/inventory.types";
import { FormLabel } from "./FormLabel";
import { MOVEMENT_LABEL, parseBRLToCents } from "./helpers";

const TYPES: StockMovementType[] = ["ENTRADA", "SAIDA", "VENDA"];

export function DialogMovimentacao({
  open,
  onOpenChange,
  products,
  branches,
  defaultCostOf,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: ProductWithStock[];
  branches: Branch[];
  /** Custo unitário (centavos) atual do produto, para pré-preencher entradas. */
  defaultCostOf: (productId: string) => number;
  onSave: (input: NewStockMovementInput) => Promise<void>;
}) {
  const [type, setType] = useState<StockMovementType>("ENTRADA");
  const [productId, setProductId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCostBRL, setUnitCostBRL] = useState("");
  const [unitPriceBRL, setUnitPriceBRL] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType("ENTRADA");
    setProductId("");
    setBranchId(branches[0]?.id ?? "");
    setQuantity("");
    setUnitCostBRL("");
    setUnitPriceBRL("");
    setNote("");
  }, [open, branches]);

  // Pré-preenche custo (entrada) ou preço (venda) ao escolher o produto/tipo.
  useEffect(() => {
    if (!productId) return;
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    if (type === "ENTRADA") {
      const cost = defaultCostOf(productId);
      setUnitCostBRL(cost ? maskBRLInput(String(cost)) : "");
    } else if (type === "VENDA") {
      setUnitPriceBRL(maskBRLInput(String(p.priceInCents)));
    }
  }, [productId, type, products, defaultCostOf]);

  async function handleSave() {
    if (!productId) {
      toast.error("Selecione um produto.");
      return;
    }
    if (branches.length > 0 && !branchId) {
      toast.error("Selecione a filial.");
      return;
    }
    const qty = Math.trunc(Number(quantity) || 0);
    if (qty <= 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }

    const input: NewStockMovementInput = {
      productId,
      branchId,
      type,
      quantity: qty,
      note: note.trim() || undefined,
      unitCostInCents:
        type === "ENTRADA" ? parseBRLToCents(unitCostBRL) || undefined : undefined,
      unitPriceInCents:
        type === "VENDA" ? parseBRLToCents(unitPriceBRL) || undefined : undefined,
    };

    setSaving(true);
    try {
      await onSave(input);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Nova Movimentação
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
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <FormLabel required>Tipo</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold transition-colors",
                    type === t
                      ? "bg-brand/15 border-brand/60 text-brand"
                      : "border-border bg-surface-base text-muted-foreground hover:border-brand/30",
                  )}
                >
                  {MOVEMENT_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Cadastre produtos antes de registrar movimentações.
            </p>
          ) : (
            <>
              <SelectField
                id="mov-produto"
                label="Produto"
                value={productId}
                placeholder="Selecione o produto"
                options={products.map((p) => ({ value: p.id, label: p.name }))}
                onChange={setProductId}
                className="min-w-0"
              />

              {branches.length > 0 && (
                <SelectField
                  id="mov-filial"
                  label="Filial"
                  value={branchId}
                  placeholder="Selecione a filial"
                  options={branches.map((b) => ({
                    value: b.id,
                    label: b.name,
                  }))}
                  onChange={setBranchId}
                  className="min-w-0"
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <FormLabel required>Quantidade</FormLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
                {type === "ENTRADA" && (
                  <div className="space-y-1.5">
                    <FormLabel>Custo unitário</FormLabel>
                    <Input
                      value={unitCostBRL}
                      onChange={(e) =>
                        setUnitCostBRL(maskBRLInput(e.target.value))
                      }
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      className={inputCls}
                    />
                  </div>
                )}
                {type === "VENDA" && (
                  <div className="space-y-1.5">
                    <FormLabel>Preço unitário</FormLabel>
                    <Input
                      value={unitPriceBRL}
                      onChange={(e) =>
                        setUnitPriceBRL(maskBRLInput(e.target.value))
                      }
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <FormLabel>Observação</FormLabel>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Opcional"
                  className={inputCls}
                />
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
            disabled={saving || products.length === 0}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Registrar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
