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
import { toast } from "sonner";
import type { ProductWithStock } from "@/hooks/useProducts";
import type { Branch } from "@/types/branch.types";
import { FormLabel } from "./FormLabel";

interface StockRow {
  branchId: string;
  branchLabel: string;
  minStock: string;
  currentStock: string;
}

export function DialogEstoque({
  open,
  onOpenChange,
  product,
  branches,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: ProductWithStock | null;
  branches: Branch[];
  onSave: (
    productId: string,
    rows: { branchId: string; minStock: number; currentStock: number }[],
  ) => Promise<void>;
}) {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !product) return;
    setRows(
      branches.map((b) => {
        const existing = product.stockPerBranch.find(
          (s) => s.branchId === b.id,
        );
        return {
          branchId: b.id,
          branchLabel: b.name,
          minStock: String(existing?.minStock ?? 0),
          currentStock: String(existing?.currentStock ?? 0),
        };
      }),
    );
  }, [open, product, branches]);

  function update(
    branchId: string,
    key: "minStock" | "currentStock",
    value: string,
  ) {
    setRows((prev) =>
      prev.map((r) => (r.branchId === branchId ? { ...r, [key]: value } : r)),
    );
  }

  async function handleSave() {
    if (!product) return;
    const payload = rows.map((r) => ({
      branchId: r.branchId,
      minStock: Math.max(0, Math.trunc(Number(r.minStock) || 0)),
      currentStock: Math.max(0, Math.trunc(Number(r.currentStock) || 0)),
    }));
    setSaving(true);
    try {
      await onSave(product.id, payload);
      toast.success("Estoque atualizado.");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold">
                Ajustar Estoque
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {product.name}
              </p>
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
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {branches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Cadastre filiais nas Configurações para controlar o estoque.
            </p>
          ) : (
            rows.map((r) => (
              <div key={r.branchId} className="space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  {r.branchLabel}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <FormLabel>Qtd. mínima</FormLabel>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={r.minStock}
                      onChange={(e) =>
                        update(
                          r.branchId,
                          "minStock",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      placeholder="0"
                      className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel>Qtd. atual</FormLabel>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={r.currentStock}
                      onChange={(e) =>
                        update(
                          r.branchId,
                          "currentStock",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      placeholder="0"
                      className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
                    />
                  </div>
                </div>
              </div>
            ))
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
            disabled={saving || branches.length === 0}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar Estoque"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
