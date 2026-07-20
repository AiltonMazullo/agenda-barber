import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, Loading } from "@/components/shared";
import type { ProductWithStock } from "@/hooks/useProducts";
import type { Branch } from "@/types/branch.types";
import { formatBRLFromCents } from "./helpers";

const COLS = [
  "Produto",
  "Filial",
  "Quantidade atual",
  "Quantidade mínima",
  "Valor de estoque",
  "Potencial de venda",
  "Opções",
];

interface StockRow {
  key: string;
  product: ProductWithStock;
  branchName: string;
  currentStock: number;
  minStock: number;
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

  const rows: StockRow[] = items.flatMap((product) =>
    product.stockPerBranch.map((s) => ({
      key: `${product.id}-${s.branchId}`,
      product,
      branchName: branchName(s.branchId),
      currentStock: s.currentStock,
      minStock: s.minStock,
    })),
  );

  return (
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
  );
}
