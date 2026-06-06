import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, EmptyState } from "@/components/shared";
import { formatDate, formatTime } from "@/utils/format";
import type { StockMovement } from "@/types/inventory.types";
import {
  MOVEMENT_LABEL,
  MOVEMENT_SIGN,
  MOVEMENT_TONE,
  formatBRLFromCents,
} from "./helpers";

type Mode = "movimentacoes" | "vendas" | "historico";

const COLS: Record<Mode, string[]> = {
  movimentacoes: [
    "Data/Hora",
    "Tipo",
    "Produto",
    "Filial",
    "Qtd.",
    "Valor un.",
    "Usuário",
  ],
  historico: [
    "Data/Hora",
    "Tipo",
    "Produto",
    "Filial",
    "Qtd.",
    "Valor un.",
    "Usuário",
  ],
  vendas: [
    "Data/Hora",
    "Produto",
    "Filial",
    "Qtd.",
    "Preço un.",
    "Total",
    "Usuário",
  ],
};

/** Valor unitário relevante por tipo (custo na entrada, preço na venda). */
function unitValueCents(m: StockMovement): number | null {
  if (m.type === "ENTRADA") return m.unitCostInCents ?? null;
  if (m.type === "VENDA") return m.unitPriceInCents ?? null;
  return null;
}

export function MovementsTable({
  movements,
  mode,
  emptyMessage,
}: {
  movements: StockMovement[];
  mode: Mode;
  emptyMessage: string;
}) {
  const cols = COLS[mode];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-t border-border">
          <TableRow className="border-border hover:bg-transparent">
            {cols.map((col) => (
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
          {movements.length === 0 ? (
            <TableRow className="border-border hover:bg-transparent">
              <TableCell colSpan={cols.length} className="py-4">
                <EmptyState message={emptyMessage} />
              </TableCell>
            </TableRow>
          ) : (
            movements.map((m) => {
              const sign = MOVEMENT_SIGN[m.type];
              const unit = unitValueCents(m);
              return (
                <TableRow
                  key={m.id}
                  className="border-border hover:bg-surface-elevated/50 transition-colors"
                >
                  <TableCell className="px-4 py-4 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(m.createdAt)}
                    <span className="text-text-faint"> · {formatTime(m.createdAt)}</span>
                  </TableCell>

                  {mode !== "vendas" && (
                    <TableCell className="px-4 py-4">
                      <StatusBadge tone={MOVEMENT_TONE[m.type]}>
                        {MOVEMENT_LABEL[m.type]}
                      </StatusBadge>
                    </TableCell>
                  )}

                  <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                    {m.productName}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                    {m.branchName || "—"}
                  </TableCell>

                  {mode === "vendas" ? (
                    <>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {m.quantity}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-foreground text-sm">
                        {unit != null ? formatBRLFromCents(unit) : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-brand font-semibold text-sm">
                        {unit != null
                          ? formatBRLFromCents(unit * m.quantity)
                          : "—"}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell
                        className={`px-4 py-4 font-semibold text-sm ${
                          sign > 0
                            ? "text-success-foreground"
                            : "text-warning-foreground"
                        }`}
                      >
                        {sign > 0 ? "+" : "−"}
                        {m.quantity}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {unit != null ? formatBRLFromCents(unit) : "—"}
                      </TableCell>
                    </>
                  )}

                  <TableCell className="px-4 py-4 text-muted-foreground text-xs">
                    {m.user}
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
