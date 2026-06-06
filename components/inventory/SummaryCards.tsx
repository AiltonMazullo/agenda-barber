import { TrendingUp, Package, Boxes, AlertTriangle } from "lucide-react";
import { SummaryCard } from "@/components/shared";
import { formatBRLFromCents } from "./helpers";

interface SummaryCardsProps {
  /** Potencial de venda: soma de (qtd. atual × preço de venda). */
  potentialCents: number;
  /** Custo do estoque: soma de (qtd. atual × custo unitário). */
  costCents: number;
  productCount: number;
  lowCount: number;
}

export function SummaryCards({
  potentialCents,
  costCents,
  productCount,
  lowCount,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <SummaryCard
        label="Potencial de Venda"
        value={formatBRLFromCents(potentialCents)}
        subtitle="Valor de venda dos itens"
        tone="success"
        icon={<TrendingUp className="size-3.5" />}
      />
      <SummaryCard
        label="Custo do Estoque"
        value={formatBRLFromCents(costCents)}
        subtitle="Custo dos produtos"
        tone="info"
        icon={<Package className="size-3.5" />}
      />
      <SummaryCard
        label="Produtos"
        value={productCount}
        tone="neutral"
        icon={<Boxes className="size-3.5" />}
      />
      <SummaryCard
        label="Estoque Baixo"
        value={lowCount}
        tone="danger"
        emphasized
        icon={<AlertTriangle className="size-3.5" />}
      />
    </div>
  );
}
