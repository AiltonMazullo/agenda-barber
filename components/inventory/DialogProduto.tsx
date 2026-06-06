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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { maskBRLInput } from "@/utils/format";
import type { ProductWithStock } from "@/hooks/useProducts";
import type {
  CreateProductPayload,
  ProductCategory,
  ProductStatus,
} from "@/types/product.types";
import { FormLabel } from "./FormLabel";
import { CATEGORY_LABEL, CATEGORY_OPTIONS, parseBRLToCents } from "./helpers";

interface ProductFormState {
  name: string;
  priceBRL: string;
  costBRL: string;
  category: ProductCategory;
  sku: string;
  status: ProductStatus;
  repurchasePeriodDays: string;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  priceBRL: "",
  costBRL: "",
  category: "BARBERSHOP_COSMETICS",
  sku: "",
  status: "ACTIVE",
  repurchasePeriodDays: "",
};

export function DialogProduto({
  open,
  onOpenChange,
  product,
  initialCostInCents,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: ProductWithStock | null;
  /** Custo unitário atual do produto (centavos), vindo da camada local. */
  initialCostInCents: number;
  onSave: (
    payload: CreateProductPayload,
    costInCents: number,
  ) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name,
        priceBRL: maskBRLInput(String(product.priceInCents)),
        costBRL: initialCostInCents
          ? maskBRLInput(String(initialCostInCents))
          : "",
        category: product.category,
        sku: product.sku ?? "",
        status: product.status,
        repurchasePeriodDays: product.repurchasePeriodDays
          ? String(product.repurchasePeriodDays)
          : "",
      });
    } else {
      setForm(EMPTY_PRODUCT_FORM);
    }
  }, [open, product, initialCostInCents]);

  function update<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (form.name.trim().length < 1) {
      toast.error("Informe o nome do produto.");
      return;
    }
    const priceInCents = parseBRLToCents(form.priceBRL);
    if (priceInCents <= 0) {
      toast.error("Informe um preço de venda válido.");
      return;
    }
    const costInCents = parseBRLToCents(form.costBRL);
    const repurchaseDays = form.repurchasePeriodDays
      ? Number(form.repurchasePeriodDays)
      : undefined;
    if (
      repurchaseDays !== undefined &&
      (!Number.isFinite(repurchaseDays) || repurchaseDays <= 0)
    ) {
      toast.error("Período de recompra inválido.");
      return;
    }

    setSaving(true);
    try {
      await onSave(
        {
          name: form.name.trim(),
          priceInCents,
          category: form.category,
          sku: form.sku.trim() || undefined,
          status: form.status,
          repurchasePeriodDays: repurchaseDays,
        },
        costInCents,
      );
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
              {product ? "Editar Produto" : "Novo Produto"}
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
            <FormLabel required>Nome</FormLabel>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ex: Pomada Modeladora"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>Valor de venda</FormLabel>
              <Input
                value={form.priceBRL}
                onChange={(e) =>
                  update("priceBRL", maskBRLInput(e.target.value))
                }
                inputMode="numeric"
                placeholder="R$ 0,00"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Custo unitário</FormLabel>
              <Input
                value={form.costBRL}
                onChange={(e) => update("costBRL", maskBRLInput(e.target.value))}
                inputMode="numeric"
                placeholder="R$ 0,00"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel>SKU</FormLabel>
              <Input
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="Opcional"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Recompra (dias)</FormLabel>
              <Input
                type="text"
                inputMode="numeric"
                value={form.repurchasePeriodDays}
                onChange={(e) =>
                  update(
                    "repurchasePeriodDays",
                    e.target.value.replace(/\D/g, ""),
                  )
                }
                placeholder="Opcional"
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <FormLabel required>Categoria</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => update("category", c)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold transition-colors",
                    form.category === c
                      ? "bg-brand/15 border-brand/60 text-brand"
                      : "border-border bg-surface-base text-muted-foreground hover:border-brand/30",
                  )}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <FormLabel>Status</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["ACTIVE", "INACTIVE"] as ProductStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("status", s)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold transition-colors",
                    form.status === s
                      ? s === "ACTIVE"
                        ? "bg-success/15 border-success/50 text-success-foreground"
                        : "bg-surface-elevated/60 border-border text-muted-foreground"
                      : "border-border bg-surface-base text-text-faint hover:border-brand/30",
                  )}
                >
                  {s === "ACTIVE" ? "Ativo" : "Inativo"}
                </button>
              ))}
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
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : product ? "Salvar" : "Criar Produto"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
