import { formatBRL } from "@/utils/format";
import type { ProductWithStock } from "@/hooks/useProducts";
import type { StockMovementType } from "@/types/inventory.types";
import type { Tone } from "@/types/common.types";

// ─── Abas ───────────────────────────────────────────────────────────────────

export type TabKey =
  | "estoque"
  | "produtos"
  | "entrada-saida"
  | "vendas"
  | "historico";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "estoque", label: "Estoque" },
  { key: "produtos", label: "Produtos" },
  { key: "entrada-saida", label: "Entrada/Saída" },
  { key: "vendas", label: "Vendas" },
  { key: "historico", label: "Histórico" },
];

// ─── Formatação ─────────────────────────────────────────────────────────────

/** Formata centavos (inteiro) como BRL. */
export function formatBRLFromCents(cents: number): string {
  return formatBRL(cents / 100);
}

/** Converte uma string BRL mascarada em centavos. */
export function parseBRLToCents(input: string): number {
  const cleaned = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

// ─── Situação do estoque ────────────────────────────────────────────────────

export type StockStatus = "ok" | "baixo" | "critico" | "vazio";

/** Deriva a situação do estoque a partir de quantidade atual/mínima (genérico). */
export function deriveStockStatus(
  currentStock: number,
  minStock: number,
): StockStatus {
  if (minStock === 0 && currentStock === 0) return "vazio";
  if (currentStock === 0) return "critico";
  if (currentStock < minStock * 0.5) return "critico";
  if (currentStock < minStock) return "baixo";
  return "ok";
}

export function deriveStatus(p: ProductWithStock): StockStatus {
  return deriveStockStatus(p.totalCurrent, p.totalMin);
}

export const STOCK_TONE: Record<StockStatus, Tone> = {
  ok: "success",
  baixo: "warning",
  critico: "danger",
  vazio: "neutral",
};

export const STOCK_LABEL: Record<StockStatus, string> = {
  ok: "Ok",
  baixo: "Baixo",
  critico: "Crítico",
  vazio: "Sem estoque",
};

// ─── Movimentações ──────────────────────────────────────────────────────────

export const MOVEMENT_LABEL: Record<StockMovementType, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  VENDA: "Venda",
};

export const MOVEMENT_TONE: Record<StockMovementType, Tone> = {
  ENTRADA: "success",
  SAIDA: "warning",
  VENDA: "info",
};

/** Sinal aplicado ao estoque por tipo de movimentação. */
export const MOVEMENT_SIGN: Record<StockMovementType, 1 | -1> = {
  ENTRADA: 1,
  SAIDA: -1,
  VENDA: -1,
};
