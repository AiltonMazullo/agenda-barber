"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { maskBRLInput } from "@/utils/format";
import type { ProductWithStock } from "@/hooks/useProducts";
import type { Category } from "@/types/category.types";
import type { CreateProductPayload, ProductStatus } from "@/types/product.types";
import type { Branch } from "@/types/branch.types";
import { FormLabel } from "./FormLabel";
import { parseBRLToCents } from "./helpers";

interface ProductFormState {
  name: string;
  priceBRL: string;
  costBRL: string;
  sku: string;
  ncm: string;
  gtin: string;
  cest: string;
  categoryId: string | null;
  repurchasePeriodDays: string;
  status: ProductStatus;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  priceBRL: "",
  costBRL: "",
  sku: "",
  ncm: "",
  gtin: "",
  cest: "",
  categoryId: null,
  repurchasePeriodDays: "",
  status: "ACTIVE",
};

interface StockRow {
  branchId: string;
  minStock: string;
  currentStock: string;
}

interface DialogNovaCategoriaProdutoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (name: string) => Promise<void>;
}

function DialogNovaCategoriaProduto({
  open,
  onOpenChange,
  onCreate,
}: DialogNovaCategoriaProdutoProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) setName("");
  }, [open]);

  async function handleCreate() {
    if (name.trim().length < 2) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    setSaving(true);
    try {
      await onCreate(name.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-xs p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-bold">
              Nova Categoria de Produto
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-5 py-4 space-y-1.5">
          <FormLabel required>Nome</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-surface-base border-border text-foreground h-9"
            autoFocus
          />
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 rounded-md border border-border bg-transparent text-xs text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleCreate}
            className="h-8 px-4 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Criando…" : "Criar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DialogProduto({
  open,
  onOpenChange,
  product,
  initialCostInCents,
  categories,
  branches,
  onSave,
  onCreateCategory,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: ProductWithStock | null;
  /** Custo unitário atual do produto (centavos), vindo da camada local. */
  initialCostInCents: number;
  categories: Category[];
  branches: Branch[];
  onSave: (
    payload: CreateProductPayload,
    costInCents: number,
    stockRows: { branchId: string; minStock: number; currentStock: number }[],
  ) => Promise<void>;
  /** Cria uma categoria de produto nova sem sair do formulário (botão "+"). */
  onCreateCategory: (name: string) => Promise<Category | null>;
}) {
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name,
        priceBRL: maskBRLInput(String(product.priceInCents)),
        costBRL: initialCostInCents
          ? maskBRLInput(String(initialCostInCents))
          : "",
        sku: product.sku ?? "",
        ncm: product.ncm ?? "",
        gtin: product.gtin ?? "",
        cest: product.cest ?? "",
        categoryId: product.categoryId,
        repurchasePeriodDays: product.repurchasePeriodDays
          ? String(product.repurchasePeriodDays)
          : "",
        status: product.status,
      });
    } else {
      setForm(EMPTY_PRODUCT_FORM);
    }
  }, [open, product, initialCostInCents]);

  useEffect(() => {
    if (!open) return;
    setStockRows(
      branches.map((b) => {
        const existing = product?.stockPerBranch.find(
          (s) => s.branchId === b.id,
        );
        return {
          branchId: b.id,
          minStock: existing ? String(existing.minStock) : "0",
          currentStock: existing ? String(existing.currentStock) : "0",
        };
      }),
    );
  }, [open, product, branches]);

  function update<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateStockRow(
    branchId: string,
    field: "minStock" | "currentStock",
    value: string,
  ) {
    setStockRows((prev) =>
      prev.map((r) =>
        r.branchId === branchId
          ? { ...r, [field]: value.replace(/\D/g, "") }
          : r,
      ),
    );
  }

  async function handleCreateCategoryInline(name: string) {
    const created = await onCreateCategory(name);
    if (created) {
      update("categoryId", created.id);
      setCategoryDialogOpen(false);
    }
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
    for (const row of stockRows) {
      if (!row.minStock.trim()) {
        toast.error("Informe o estoque mínimo de todas as filiais.");
        return;
      }
    }

    setSaving(true);
    try {
      await onSave(
        {
          name: form.name.trim(),
          priceInCents,
          sku: form.sku.trim() || undefined,
          ncm: form.ncm.trim() || undefined,
          gtin: form.gtin.trim() || undefined,
          cest: form.cest.trim() || undefined,
          categoryId: form.categoryId ?? undefined,
          repurchasePeriodDays: repurchaseDays,
          status: form.status,
        },
        costInCents,
        stockRows.map((r) => ({
          branchId: r.branchId,
          minStock: Number(r.minStock) || 0,
          currentStock: Number(r.currentStock) || 0,
        })),
      );
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10";

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-2xl p-0 gap-0">
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
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>Nome</FormLabel>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex: Pomada Modeladora"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>Valor</FormLabel>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel>SKU</FormLabel>
              <Input
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>NCM</FormLabel>
              <Input
                value={form.ncm}
                onChange={(e) => update("ncm", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel>GTIN</FormLabel>
              <Input
                value={form.gtin}
                onChange={(e) => update("gtin", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>CEST</FormLabel>
              <Input
                value={form.cest}
                onChange={(e) => update("cest", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <FormLabel required>Custo unitário</FormLabel>
            <Input
              value={form.costBRL}
              onChange={(e) => update("costBRL", maskBRLInput(e.target.value))}
              inputMode="numeric"
              placeholder="R$ 0,00"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <FormLabel required>Categoria</FormLabel>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <div className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm flex items-center justify-between gap-2 text-left">
                    <span
                      className={
                        selectedCategory
                          ? "text-foreground"
                          : "text-text-faint"
                      }
                    >
                      {selectedCategory?.name ?? "Sem categoria"}
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-raised border-border text-foreground max-h-48 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuItem
                    onClick={() => update("categoryId", null)}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      !form.categoryId && "text-brand",
                    )}
                  >
                    Sem categoria
                  </DropdownMenuItem>
                  {categories.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => update("categoryId", c.id)}
                      className={cn(
                        "text-xs hover:bg-surface-elevated cursor-pointer",
                        form.categoryId === c.id && "text-brand",
                      )}
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              type="button"
              onClick={() => setCategoryDialogOpen(true)}
              title="Nova categoria"
              className="size-10 rounded-md bg-brand text-brand-foreground flex items-center justify-center hover:bg-brand-hover transition-colors shrink-0"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <FormLabel>Período para recompra (em dias)</FormLabel>
              <InfoTooltip text="Usado para ações de marketing e vendas: define quando o cliente deve ser lembrado de comprar este produto de novo." />
            </div>
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
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <FormLabel required>Status</FormLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm flex items-center justify-between gap-2 text-left">
                  <span className="text-foreground">
                    {form.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground w-[var(--radix-dropdown-menu-trigger-width)]">
                {(["ACTIVE", "INACTIVE"] as ProductStatus[]).map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => update("status", s)}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      form.status === s && "text-brand",
                    )}
                  >
                    {s === "ACTIVE" ? "Ativo" : "Inativo"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {branches.length > 0 && (
            <div className="pt-2 border-t border-border-subtle space-y-3">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Dados estoque
                </p>
                <p className="text-xs text-muted-foreground">
                  Preencha todos os campos obrigatórios.
                </p>
              </div>
              {branches.map((b) => {
                const row = stockRows.find((r) => r.branchId === b.id);
                if (!row) return null;
                return (
                  <div
                    key={b.id}
                    className="grid grid-cols-[1fr_auto_auto] gap-3 items-end"
                  >
                    <span className="text-sm font-semibold text-brand truncate">
                      {b.name} - {b.city}:
                    </span>
                    <div className="space-y-1.5 w-32">
                      <FormLabel required>Estoque mínimo</FormLabel>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={row.minStock}
                        onChange={(e) =>
                          updateStockRow(b.id, "minStock", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-1.5 w-32">
                      <FormLabel>Estoque atual</FormLabel>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={row.currentStock}
                        onChange={(e) =>
                          updateStockRow(b.id, "currentStock", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </DialogContent>

      <DialogNovaCategoriaProduto
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onCreate={handleCreateCategoryInline}
      />
    </Dialog>
  );
}
