"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField, StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { maskBRLInput } from "@/utils/format";
import type { ProductWithStock } from "@/hooks/useProducts";
import type { Branch } from "@/types/branch.types";
import type {
  NewStockMovementBatchInput,
  NewStockMovementInput,
  StockMovementType,
} from "@/types/inventory.types";
import { FormLabel } from "./FormLabel";
import {
  MOVEMENT_LABEL,
  MOVEMENT_TONE,
  formatBRLFromCents,
  parseBRLToCents,
} from "./helpers";

const TYPES: StockMovementType[] = ["ENTRADA", "SAIDA", "VENDA"];

/** Item empilhado localmente antes de enviar (lote ou item único). */
interface StagedItem {
  key: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  unitCostInCents?: number;
  unitPriceInCents?: number;
  note?: string;
}

export function DialogMovimentacao({
  open,
  onOpenChange,
  products,
  branches,
  defaultCostOf,
  onSave,
  onSaveBatch,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: ProductWithStock[];
  branches: Branch[];
  /** Custo unitário (centavos) atual do produto, para pré-preencher entradas. */
  defaultCostOf: (productId: string) => number;
  onSave: (input: NewStockMovementInput) => Promise<void>;
  onSaveBatch: (input: NewStockMovementBatchInput) => Promise<unknown>;
}) {
  const [type, setType] = useState<StockMovementType>("ENTRADA");
  const [productId, setProductId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCostBRL, setUnitCostBRL] = useState("");
  const [unitPriceBRL, setUnitPriceBRL] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<StagedItem[]>([]);
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
    setItems([]);
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

  function resetItemFields() {
    setProductId("");
    setQuantity("");
    setUnitCostBRL("");
    setUnitPriceBRL("");
    setNote("");
  }

  /** Valida os campos do formulário atual e retorna o item pronto (ou null + toast de erro). */
  function buildItemFromForm(): StagedItem | null {
    if (!productId) {
      toast.error("Selecione um produto.");
      return null;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return null;
    const qty = Math.trunc(Number(quantity) || 0);
    if (qty <= 0) {
      toast.error("Informe uma quantidade válida.");
      return null;
    }
    return {
      key: `${productId}-${Date.now()}-${Math.random()}`,
      productId,
      productName: product.name,
      type,
      quantity: qty,
      unitCostInCents:
        type === "ENTRADA" ? parseBRLToCents(unitCostBRL) || undefined : undefined,
      unitPriceInCents:
        type === "VENDA" ? parseBRLToCents(unitPriceBRL) || undefined : undefined,
      note: note.trim() || undefined,
    };
  }

  function handleAddItem() {
    const item = buildItemFromForm();
    if (!item) return;
    setItems((prev) => [...prev, item]);
    resetItemFields();
  }

  function handleRemoveItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  async function handleSave() {
    if (branches.length > 0 && !branchId) {
      toast.error("Selecione a filial.");
      return;
    }

    let finalItems = items;
    if (finalItems.length === 0) {
      const item = buildItemFromForm();
      if (!item) return;
      finalItems = [item];
    }

    setSaving(true);
    try {
      if (finalItems.length === 1) {
        const only = finalItems[0];
        await onSave({
          productId: only.productId,
          branchId,
          type: only.type,
          quantity: only.quantity,
          note: only.note,
          unitCostInCents: only.unitCostInCents,
          unitPriceInCents: only.unitPriceInCents,
        });
      } else {
        await onSaveBatch({
          branchId: branchId || undefined,
          items: finalItems.map((i) => ({
            productId: i.productId,
            type: i.type,
            quantity: i.quantity,
            unitCostInCents: i.unitCostInCents,
            unitPriceInCents: i.unitPriceInCents,
            note: i.note,
          })),
        });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0">
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
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
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

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full h-9 rounded-md border border-dashed border-brand/50 text-brand text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-brand/10 transition-colors"
              >
                <Plus className="size-3.5" />
                Adicionar à lista
              </button>

              {items.length > 0 && (
                <div className="space-y-1.5">
                  <FormLabel>
                    Produtos adicionados ({items.length})
                  </FormLabel>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const unit =
                        item.type === "ENTRADA"
                          ? item.unitCostInCents
                          : item.type === "VENDA"
                            ? item.unitPriceInCents
                            : undefined;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-base px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <StatusBadge tone={MOVEMENT_TONE[item.type]}>
                                {MOVEMENT_LABEL[item.type]}
                              </StatusBadge>
                              <span className="font-semibold text-sm text-foreground truncate">
                                {item.productName}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Qtd. {item.quantity}
                              {unit != null && (
                                <> · {formatBRLFromCents(unit)}/un.</>
                              )}
                              {item.note && <> · {item.note}</>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.key)}
                            title="Remover"
                            className="size-7 shrink-0 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
