import { useMemo, useState } from "react";
import { Download, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, Loading, SelectField } from "@/components/shared";
import { exportToCsv } from "@/utils/csv-export";
import type { ProductWithStock } from "@/hooks/useProducts";
import type { Branch } from "@/types/branch.types";
import {
  deriveStockStatus,
  formatBRLFromCents,
  STOCK_LABEL,
  type StockStatus,
} from "./helpers";

const COLS = [
  "Produto",
  "Filial",
  "Quantidade atual",
  "Quantidade mínima",
  "Valor de estoque",
  "Potencial de venda",
  "Opções",
];

const STATUS_OPTIONS: { value: StockStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ok", label: STOCK_LABEL.ok },
  { value: "baixo", label: STOCK_LABEL.baixo },
  { value: "critico", label: STOCK_LABEL.critico },
  { value: "vazio", label: STOCK_LABEL.vazio },
];

interface StockRow {
  key: string;
  product: ProductWithStock;
  branchId: string;
  branchName: string;
  currentStock: number;
  minStock: number;
  status: StockStatus;
}

export function TabEstoque({
  items,
  branches,
  costOf,
  isLoading,
  isEmpty,
  onAjustar,
}: {
  items: ProductWithStock[];
  branches: Branch[];
  costOf: (productId: string) => number;
  isLoading: boolean;
  isEmpty: boolean;
  onAjustar: (product: ProductWithStock) => void;
}) {
  const branchName = (branchId: string) =>
    branches.find((b) => b.id === branchId)?.name ?? "—";

  const [branchFilter, setBranchFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "todos">(
    "todos",
  );

  const allRows: StockRow[] = items.flatMap((product) =>
    product.stockPerBranch.map((s) => ({
      key: `${product.id}-${s.branchId}`,
      product,
      branchId: s.branchId,
      branchName: branchName(s.branchId),
      currentStock: s.currentStock,
      minStock: s.minStock,
      status: deriveStockStatus(s.currentStock, s.minStock),
    })),
  );

  const rows = useMemo(
    () =>
      allRows.filter(
        (r) =>
          (branchFilter === "todas" || r.branchId === branchFilter) &&
          (statusFilter === "todos" || r.status === statusFilter),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, branchFilter, statusFilter],
  );

  function handleExportCsv() {
    exportToCsv(
      "estoque",
      rows.map((row) => {
        const costInCents = costOf(row.product.id);
        return {
          produto: row.product.name,
          filial: row.branchName,
          quantidadeAtual: row.currentStock,
          quantidadeMinima: row.minStock,
          valorEstoque: (row.currentStock * costInCents / 100).toFixed(2),
          potencialVenda: (
            (row.currentStock * row.product.priceInCents) /
            100
          ).toFixed(2),
        };
      }),
      [
        { key: "produto", label: "Produto" },
        { key: "filial", label: "Filial" },
        { key: "quantidadeAtual", label: "Quantidade atual" },
        { key: "quantidadeMinima", label: "Quantidade mínima" },
        { key: "valorEstoque", label: "Valor de estoque (R$)" },
        { key: "potencialVenda", label: "Potencial de venda (R$)" },
      ],
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3 px-4">
        <SelectField
          id="estoque-filtro-filial"
          label="Filial"
          value={branchFilter}
          options={[
            { value: "todas", label: "Todas" },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
          onChange={setBranchFilter}
          className="min-w-0 max-w-[220px]"
        />
        <SelectField
          id="estoque-filtro-status"
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={setStatusFilter}
          className="min-w-0 max-w-[180px]"
        />
        <button
          type="button"
          onClick={handleExportCsv}
          className="h-10 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
        >
          <Download className="size-3.5" />
          CSV
        </button>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-t border-border">
          <TableRow className="border-border hover:bg-transparent">
            {COLS.map((col, i) => (
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
              <TableCell colSpan={COLS.length} className="py-4">
                <Loading />
              </TableCell>
            </TableRow>
          ) : isEmpty || rows.length === 0 ? (
            <TableRow className="border-border hover:bg-transparent">
              <TableCell colSpan={COLS.length} className="py-4">
                <EmptyState message="Nenhum produto encontrado." />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const costInCents = costOf(row.product.id);
              const stockValueCents = row.currentStock * costInCents;
              const potentialCents =
                row.currentStock * row.product.priceInCents;
              return (
                <TableRow
                  key={row.key}
                  className="border-border hover:bg-surface-elevated/50 transition-colors"
                >
                  <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                    {row.product.name}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                    {row.branchName}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                    {row.currentStock}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                    {row.minStock}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                    {formatBRLFromCents(stockValueCents)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                    {formatBRLFromCents(potentialCents)}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onAjustar(row.product)}
                      title="Ajustar estoque"
                      className="size-7 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Pencil className="size-3.5" />
                    </button>
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
