"use client";

import { useMemo, useState } from "react";
import { Download, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge, EmptyState, Loading } from "@/components/shared";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import type { ProductWithStock } from "@/hooks/useProducts";
import { formatBRLFromCents } from "./helpers";
import { formatDate } from "@/utils/format";
import { exportToCsv } from "@/utils/csv-export";

const BASE_COLS = [
  "Produto",
  "Categoria",
  "SKU",
  "Custo",
  "Preço",
  "Status",
  "ID",
  "Criado em",
  "Atualizado em",
  "",
];

export function TabProdutos({
  items,
  isLoading,
  isEmpty,
  costOf,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
}: {
  items: ProductWithStock[];
  isLoading: boolean;
  isEmpty: boolean;
  costOf: (productId: string) => number;
  onEdit: (product: ProductWithStock) => void;
  onDelete: (product: ProductWithStock) => void;
  /**
   * Handler opcional para abrir a criação de um novo produto. O diálogo de
   * criação hoje é controlado pela página pai (`inventory/page.tsx`), que
   * ainda não repassa esse callback — enquanto isso não acontecer, o botão
   * "Novo Produto" local fica oculto (não há como abrir o diálogo sem esse
   * callback).
   */
  onCreate?: () => void;
  /**
   * Handler opcional para recarregar a lista de produtos junto ao pai. Se
   * não for fornecido, o botão de atualizar recarrega a página inteira como
   * alternativa — a busca (`useProducts`) roda no componente pai e não
   * expõe uma função de refetch até este ponto.
   */
  onRefresh?: () => void;
}) {
  const [showInactive, setShowInactive] = useState(false);

  const visibleItems = useMemo(
    () =>
      showInactive ? items : items.filter((p) => p.status !== "INACTIVE"),
    [items, showInactive],
  );

  const isEmptyVisible = !isLoading && visibleItems.length === 0;

  function handleRefresh() {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  }

  function handleExportCsv() {
    exportToCsv(
      "produtos",
      visibleItems as unknown as Record<string, unknown>[],
      [
        { key: "id", label: "ID" },
        { key: "name", label: "Produto" },
        { key: "sku", label: "SKU" },
        { key: "priceInCents", label: "Preço (centavos)" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Criado em" },
        { key: "updatedAt", label: "Atualizado em" },
      ],
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
          <Checkbox
            checked={showInactive}
            onCheckedChange={(checked) => setShowInactive(checked === true)}
          />
          Mostrar registros inativos?
        </label>

        <div className="flex items-center gap-2 shrink-0">
          {onCreate && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCreate}
                className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
              >
                <Plus className="size-3.5" />
                Novo Produto
              </button>
              <InfoTooltip text="Cadastra um novo produto no catálogo, disponível para controle de estoque e venda." />
            </div>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <Download className="size-3.5" />
            CSV
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Atualizar"
            title="Atualizar"
            className="size-9 rounded-md border border-border bg-surface-raised text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-t border-border">
            <TableRow className="border-border hover:bg-transparent">
              {BASE_COLS.map((col, i) => (
                <TableHead
                  key={col || `c-${i}`}
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
                <TableCell colSpan={BASE_COLS.length} className="py-4">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : isEmpty || isEmptyVisible ? (
              <TableRow className="border-border hover:bg-transparent">
                <TableCell colSpan={BASE_COLS.length} className="py-4">
                  <EmptyState
                    message={
                      isEmpty
                        ? "Nenhum produto cadastrado."
                        : "Nenhum produto ativo. Marque \"Mostrar registros inativos?\" para ver os inativos."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((p) => {
                const cost = costOf(p.id);
                return (
                  <TableRow
                    key={p.id}
                    className="border-border hover:bg-surface-elevated/50 transition-colors"
                  >
                    <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                      {p.name}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                      {p.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground text-xs font-mono">
                      {p.sku ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-info-foreground font-semibold text-sm">
                      {cost > 0 ? formatBRLFromCents(cost) : "—"}
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
                    <TableCell className="px-4 py-4 text-muted-foreground text-xs font-mono">
                      {p.id}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground text-xs">
                      {formatDate(p.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground text-xs">
                      {formatDate(p.updatedAt)}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(p)}
                          className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(p)}
                          className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
