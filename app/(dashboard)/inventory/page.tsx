"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PageHeader,
  DataTablePagination,
  ConfirmDialog,
} from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { usePagination } from "@/hooks/usePagination";
import { useProducts, type ProductWithStock } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProductCosts } from "@/hooks/useProductCosts";
import { useStockMovements } from "@/hooks/useStockMovements";
import type { CreateProductPayload } from "@/types/product.types";
import type {
  NewStockMovementInput,
  StockMovement,
} from "@/types/inventory.types";
import {
  SummaryCards,
  InventoryTabs,
  DialogProduto,
  DialogEstoque,
  DialogMovimentacao,
  TabEstoque,
  TabProdutos,
  MovementsTable,
  deriveStatus,
  MOVEMENT_SIGN,
  type TabKey,
} from "@/components/inventory";

export default function EstoquePage() {
  const { barbershop } = useAuth();
  const { products, isLoading, create, update, remove, upsertStock } =
    useProducts(barbershop?.id);
  const { categories } = useCategories(barbershop?.id);
  const { branches } = useBranches(barbershop?.id);
  const { costOf, setCost, removeCost } = useProductCosts(barbershop?.id);
  const { movements, addMovement } = useStockMovements(barbershop?.id);

  const [activeTab, setActiveTab] = useState<TabKey>("estoque");
  const [search, setSearch] = useState("");

  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithStock | null>(null);

  const [stockDialog, setStockDialog] = useState(false);
  const [stockProduct, setStockProduct] = useState<ProductWithStock | null>(
    null,
  );

  const [movDialog, setMovDialog] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ProductWithStock | null>(
    null,
  );

  const isProductTab = activeTab === "estoque" || activeTab === "produtos";

  // ─── Produtos (filtro + paginação) ──────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false),
    );
  }, [products, search]);

  const pag = usePagination(filtered, 10);

  // ─── Movimentações (filtro por produto) ─────────────────────────────────────
  const movFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return movements;
    return movements.filter((m) => m.productName.toLowerCase().includes(q));
  }, [movements, search]);

  const entradaSaida = useMemo(
    () => movFiltered.filter((m) => m.type !== "VENDA"),
    [movFiltered],
  );
  const vendas = useMemo(
    () => movFiltered.filter((m) => m.type === "VENDA"),
    [movFiltered],
  );

  // ─── Indicadores ────────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const potentialCents = products.reduce(
      (acc, p) => acc + p.totalCurrent * p.priceInCents,
      0,
    );
    const costCents = products.reduce(
      (acc, p) => acc + p.totalCurrent * costOf(p.id),
      0,
    );
    const lowCount = products.filter((p) => {
      const s = deriveStatus(p);
      return s === "baixo" || s === "critico";
    }).length;
    return {
      potentialCents,
      costCents,
      productCount: products.length,
      lowCount,
    };
  }, [products, costOf]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  async function handleProductSave(
    payload: CreateProductPayload,
    costInCents: number,
  ) {
    if (editingProduct) {
      await update(editingProduct.id, payload);
      setCost(editingProduct.id, costInCents);
    } else {
      const created = await create(payload);
      if (created) setCost(created.id, costInCents);
    }
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

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const ok = await remove(deleteTarget.id);
    if (ok) removeCost(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleMovimentacao(input: NewStockMovementInput) {
    const product = products.find((p) => p.id === input.productId);
    if (!product) return;
    const branch = branches.find((b) => b.id === input.branchId);

    // Sincroniza o estoque real (quando há filial) via upsertStock.
    if (input.branchId) {
      const existing = product.stockPerBranch.find(
        (s) => s.branchId === input.branchId,
      );
      const currentStock = existing?.currentStock ?? 0;
      const minStock = existing?.minStock ?? 0;
      const delta = MOVEMENT_SIGN[input.type] * input.quantity;
      const newCurrent = Math.max(0, currentStock + delta);
      await upsertStock(input.productId, input.branchId, {
        minStock,
        currentStock: newCurrent,
      });
    }

    // Entrada com custo atualiza o custo unitário do produto.
    if (input.type === "ENTRADA" && input.unitCostInCents) {
      setCost(input.productId, input.unitCostInCents);
    }

    const movement: StockMovement = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      branchId: input.branchId,
      branchName: branch?.name ?? "",
      type: input.type,
      quantity: input.quantity,
      unitCostInCents: input.unitCostInCents,
      unitPriceInCents: input.unitPriceInCents,
      note: input.note,
      user: barbershop?.name ?? "Sistema",
      createdAt: new Date().toISOString(),
    };
    addMovement(movement);
  }

  const searchPlaceholder = isProductTab
    ? "Buscar por nome ou SKU..."
    : "Buscar por produto...";

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Estoque"
        subtitle="Controle de produtos e estoque por filial"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setMovDialog(true)}
              className="cursor-pointer h-9 text-xs font-semibold border-border bg-surface-raised hover:border-brand/40 hover:text-brand transition-colors"
            >
              <Plus className="size-3.5 mr-1.5" />
              Nova Movimentação
            </Button>
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
          </div>
        }
      />

      <SummaryCards
        potentialCents={summary.potentialCents}
        costCents={summary.costCents}
        productCount={summary.productCount}
        lowCount={summary.lowCount}
      />

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <InventoryTabs active={activeTab} onChange={setActiveTab} />

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
              />
            </div>
          </div>

          {activeTab === "estoque" && (
            <TabEstoque
              items={pag.pageItems}
              isLoading={isLoading}
              isEmpty={filtered.length === 0}
              onAjustar={(p) => {
                setStockProduct(p);
                setStockDialog(true);
              }}
            />
          )}

          {activeTab === "produtos" && (
            <TabProdutos
              items={pag.pageItems}
              isLoading={isLoading}
              isEmpty={filtered.length === 0}
              costOf={costOf}
              onEdit={(p) => {
                setEditingProduct(p);
                setProductDialog(true);
              }}
              onDelete={(p) => setDeleteTarget(p)}
            />
          )}

          {activeTab === "entrada-saida" && (
            <MovementsTable
              movements={entradaSaida}
              mode="movimentacoes"
              emptyMessage="Nenhuma entrada ou saída registrada."
            />
          )}

          {activeTab === "vendas" && (
            <MovementsTable
              movements={vendas}
              mode="vendas"
              emptyMessage="Nenhuma venda registrada."
            />
          )}

          {activeTab === "historico" && (
            <MovementsTable
              movements={movFiltered}
              mode="historico"
              emptyMessage="Nenhuma movimentação registrada."
            />
          )}

          {isProductTab && pag.total > 0 && (
            <DataTablePagination
              page={pag.page}
              pageSize={pag.pageSize}
              totalPages={pag.totalPages}
              total={pag.total}
              from={pag.from}
              to={pag.to}
              onPageChange={pag.setPage}
              onPageSizeChange={pag.setPageSize}
            />
          )}
        </CardContent>
      </Card>

      <DialogProduto
        open={productDialog}
        onOpenChange={setProductDialog}
        product={editingProduct}
        initialCostInCents={editingProduct ? costOf(editingProduct.id) : 0}
        categories={categories}
        onSave={handleProductSave}
      />

      <DialogEstoque
        open={stockDialog}
        onOpenChange={setStockDialog}
        product={stockProduct}
        branches={branches}
        onSave={handleStockSave}
      />

      <DialogMovimentacao
        open={movDialog}
        onOpenChange={setMovDialog}
        products={products}
        branches={branches}
        defaultCostOf={costOf}
        onSave={handleMovimentacao}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remover produto?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" será removido permanentemente. Essa ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
