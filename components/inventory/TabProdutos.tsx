import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, EmptyState, Loading } from "@/components/shared";
import type { ProductWithStock } from "@/hooks/useProducts";
import { formatBRLFromCents } from "./helpers";

const COLS = ["Produto", "Categoria", "SKU", "Custo", "Preço", "Status", ""];

export function TabProdutos({
  items,
  isLoading,
  isEmpty,
  costOf,
  onEdit,
  onDelete,
}: {
  items: ProductWithStock[];
  isLoading: boolean;
  isEmpty: boolean;
  costOf: (productId: string) => number;
  onEdit: (product: ProductWithStock) => void;
  onDelete: (product: ProductWithStock) => void;
}) {
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
          ) : isEmpty ? (
            <TableRow className="border-border hover:bg-transparent">
              <TableCell colSpan={COLS.length} className="py-4">
                <EmptyState message="Nenhum produto cadastrado." />
              </TableCell>
            </TableRow>
          ) : (
            items.map((p) => {
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
  );
}
