"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  TrendingUp,
  AlertTriangle,
  Pencil,
  Trash2,
  Boxes,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState, StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { maskBRLInput } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import {
  useProducts,
  type ProductWithStock,
} from "@/hooks/useProducts";
import type { Branch } from "@/types/branch.types";
import type {
  CreateProductPayload,
  ProductCategory,
  ProductStatus,
} from "@/types/product.types";

// ─── Configuração ─────────────────────────────────────────────────────────────

type TabKey = "estoque" | "produtos";

const TABS: { key: TabKey; label: string }[] = [
  { key: "estoque", label: "Estoque" },
  { key: "produtos", label: "Produtos" },
];

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  CLOTHING: "Vestuário",
  BARBERSHOP_COSMETICS: "Cosméticos",
  BAR: "Bar",
  BARBERSHOP_ACCESSORIES: "Acessórios",
};

const CATEGORY_OPTIONS: ProductCategory[] = [
  "CLOTHING",
  "BARBERSHOP_COSMETICS",
  "BAR",
  "BARBERSHOP_ACCESSORIES",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRLFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseBRLToCents(input: string): number {
  const cleaned = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

function FormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
      {children}
      {required && <span className="text-brand">*</span>}
    </label>
  );
}

function deriveStatus(p: ProductWithStock): "ok" | "baixo" | "critico" | "vazio" {
  if (p.totalMin === 0 && p.totalCurrent === 0) return "vazio";
  if (p.totalCurrent === 0) return "critico";
  if (p.totalCurrent < p.totalMin * 0.5) return "critico";
  if (p.totalCurrent < p.totalMin) return "baixo";
  return "ok";
}

const STOCK_TONE = {
  ok: "success",
  baixo: "warning",
  critico: "danger",
  vazio: "neutral",
} as const;

const STOCK_LABEL = {
  ok: "Ok",
  baixo: "Baixo",
  critico: "Crítico",
  vazio: "Sem estoque",
} as const;

// ─── Dialog: Produto ──────────────────────────────────────────────────────────

interface ProductFormState {
  name: string;
  priceBRL: string;
  category: ProductCategory;
  sku: string;
  status: ProductStatus;
  repurchasePeriodDays: string;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  priceBRL: "",
  category: "BARBERSHOP_COSMETICS",
  sku: "",
  status: "ACTIVE",
  repurchasePeriodDays: "",
};

function DialogProduto({
  open,
  onOpenChange,
  product,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: ProductWithStock | null;
  onSave: (payload: CreateProductPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name,
        priceBRL: maskBRLInput(String(product.priceInCents)),
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
  }, [open, product]);

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
      toast.error("Informe um preço válido.");
      return;
    }
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
      await onSave({
        name: form.name.trim(),
        priceInCents,
        category: form.category,
        sku: form.sku.trim() || undefined,
        status: form.status,
        repurchasePeriodDays: repurchaseDays,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

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
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>Valor</FormLabel>
              <Input
                value={form.priceBRL}
                onChange={(e) =>
                  update("priceBRL", maskBRLInput(e.target.value))
                }
                inputMode="numeric"
                placeholder="R$ 0,00"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>SKU</FormLabel>
              <Input
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="Opcional"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
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

          <div className="grid grid-cols-2 gap-3">
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
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
              />
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

// ─── Dialog: Ajustar Estoque (por filial) ─────────────────────────────────────

interface StockRow {
  branchId: string;
  branchLabel: string;
  minStock: string;
  currentStock: string;
}

function DialogEstoque({
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

  function update(branchId: string, key: "minStock" | "currentStock", value: string) {
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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function EstoquePage() {
  const { barbershop } = useAuth();
  const { products, isLoading, create, update, remove, upsertStock } =
    useProducts(barbershop?.id);
  const { branches } = useBranches(barbershop?.id);

  const [activeTab, setActiveTab] = useState<TabKey>("estoque");
  const [search, setSearch] = useState("");

  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithStock | null>(null);

  const [stockDialog, setStockDialog] = useState(false);
  const [stockProduct, setStockProduct] = useState<ProductWithStock | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false),
    );
  }, [products, search]);

  const summary = useMemo(() => {
    const totalUn = products.reduce((acc, p) => acc + p.totalCurrent, 0);
    const totalValueCents = products.reduce(
      (acc, p) => acc + p.totalCurrent * p.priceInCents,
      0,
    );
    const lowCount = products.filter((p) => {
      const s = deriveStatus(p);
      return s === "baixo" || s === "critico";
    }).length;
    return {
      totalUn,
      totalValueCents,
      productCount: products.length,
      lowCount,
    };
  }, [products]);

  async function handleProductSave(payload: CreateProductPayload) {
    if (editingProduct) {
      await update(editingProduct.id, payload);
    } else {
      await create(payload);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este produto? Essa ação não pode ser desfeita.")) {
      return;
    }
    await remove(id);
  }

  async function handleStockSave(
    productId: string,
    rows: { branchId: string; minStock: number; currentStock: number }[],
  ) {
    await Promise.all(
      rows.map((r) =>
        upsertStock(productId, r.branchId, {
          minStock: r.minStock,
          currentStock: r.currentStock,
        }),
      ),
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Estoque"
        subtitle="Controle de produtos e estoque por filial"
        actions={
          <Button
            onClick={() => {
              setEditingProduct(null);
              setProductDialog(true);
            }}
            className="cursor-pointer bg-brand hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] text-brand-foreground font-bold h-9 text-xs transition-all"
          >
            <Plus className="size-3.5 mr-1.5" />
            Novo Produto
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-surface-raised border-border shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total em Estoque
              </p>
              <Package className="size-3.5 text-brand" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">
              {summary.totalUn} un.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-raised border-border shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Valor do Estoque
              </p>
              <TrendingUp className="size-3.5 text-info-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-info-foreground">
              {formatBRLFromCents(summary.totalValueCents)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-raised border-border shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Produtos
              </p>
              <Boxes className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">
              {summary.productCount}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-danger-bg border-border shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Estoque Baixo
              </p>
              <AlertTriangle className="size-3.5 text-danger-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-danger-foreground">
              {summary.lowCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="px-4 pt-4 flex gap-1 flex-wrap border-b border-border-subtle pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-xs font-semibold transition-colors rounded-t-md -mb-px ${
                  activeTab === tab.key
                    ? "bg-brand text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
              />
            </div>
          </div>

          {activeTab === "estoque" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-t border-border">
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "Produto",
                      "Categoria",
                      "Qtd. Atual",
                      "Qtd. Mínima",
                      "Valor",
                      "Status",
                      "",
                    ].map((col) => (
                      <TableHead
                        key={col}
                        className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                      >
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow className="border-border hover:bg-transparent">
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center text-sm text-text-faint"
                      >
                        Carregando…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow className="border-border hover:bg-transparent">
                      <TableCell colSpan={7} className="py-4">
                        <EmptyState message="Nenhum produto encontrado." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => {
                      const status = deriveStatus(p);
                      return (
                        <TableRow
                          key={p.id}
                          className="border-border hover:bg-surface-elevated/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                            {p.name}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {CATEGORY_LABEL[p.category]}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {p.totalCurrent}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {p.totalMin}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                            {formatBRLFromCents(p.totalCurrent * p.priceInCents)}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge tone={STOCK_TONE[status]}>
                              {STOCK_LABEL[status]}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => {
                                setStockProduct(p);
                                setStockDialog(true);
                              }}
                              className="h-7 px-3 rounded-md border border-border bg-surface-base text-xs text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors"
                            >
                              Ajustar
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "produtos" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-t border-border">
                  <TableRow className="border-border hover:bg-transparent">
                    {["Produto", "Categoria", "SKU", "Preço", "Status", ""].map(
                      (col) => (
                        <TableHead
                          key={col}
                          className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                        >
                          {col}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow className="border-border hover:bg-transparent">
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-sm text-text-faint"
                      >
                        Carregando…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow className="border-border hover:bg-transparent">
                      <TableCell colSpan={6} className="py-4">
                        <EmptyState message="Nenhum produto cadastrado." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow
                        key={p.id}
                        className="border-border hover:bg-surface-elevated/50 transition-colors"
                      >
                        <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                          {p.name}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                          {CATEGORY_LABEL[p.category]}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-muted-foreground text-xs font-mono">
                          {p.sku ?? "—"}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-brand font-semibold text-sm">
                          {formatBRLFromCents(p.priceInCents)}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <StatusBadge
                            tone={p.status === "ACTIVE" ? "success" : "neutral"}
                          >
                            {p.status === "ACTIVE" ? "Ativo" : "Inativo"}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(p);
                                setProductDialog(true);
                              }}
                              className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                            >
                              <Pencil className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id)}
                              className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DialogProduto
        open={productDialog}
        onOpenChange={setProductDialog}
        product={editingProduct}
        onSave={handleProductSave}
      />

      <DialogEstoque
        open={stockDialog}
        onOpenChange={setStockDialog}
        product={stockProduct}
        branches={branches}
        onSave={handleStockSave}
      />
    </div>
  );
}
