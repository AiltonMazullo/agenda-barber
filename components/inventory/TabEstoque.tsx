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
import {
  STOCK_LABEL,
  STOCK_TONE,
  deriveStatus,
  formatBRLFromCents,
} from "./helpers";

const COLS = [
  "Produto",
  "Categoria",
  "Qtd. Atual",
  "Qtd. Mínima",
  "Valor",
  "Status",
  "",
];

export function TabEstoque({
  items,
  isLoading,
  isEmpty,
  onAjustar,
}: {
  items: ProductWithStock[];
  isLoading: boolean;
  isEmpty: boolean;
  onAjustar: (product: ProductWithStock) => void;
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
                <EmptyState message="Nenhum produto encontrado." />
              </TableCell>
            </TableRow>
          ) : (
            items.map((p) => {
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
                    {p.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                    {p.totalCurrent}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                    {p.totalMin}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                    {formatBRLFromCents(p.priceInCents)}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusBadge tone={STOCK_TONE[status]}>
                      {STOCK_LABEL[status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onAjustar(p)}
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
  );
}
