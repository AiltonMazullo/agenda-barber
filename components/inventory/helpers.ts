import { formatBRL } from "@/utils/format";
import type { ProductWithStock } from "@/hooks/useProducts";
import type { ProductCategory } from "@/types/product.types";
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

// ─── Categorias ─────────────────────────────────────────────────────────────

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  CLOTHING: "Vestuário",
  BARBERSHOP_COSMETICS: "Cosméticos",
  BAR: "Bar",
  BARBERSHOP_ACCESSORIES: "Acessórios",
};

export const CATEGORY_OPTIONS: ProductCategory[] = [
  "CLOTHING",
  "BARBERSHOP_COSMETICS",
  "BAR",
  "BARBERSHOP_ACCESSORIES",
];

// ─── Situação do estoque ────────────────────────────────────────────────────

export type StockStatus = "ok" | "baixo" | "critico" | "vazio";

export function deriveStatus(p: ProductWithStock): StockStatus {
  if (p.totalMin === 0 && p.totalCurrent === 0) return "vazio";
  if (p.totalCurrent === 0) return "critico";
  if (p.totalCurrent < p.totalMin * 0.5) return "critico";
  if (p.totalCurrent < p.totalMin) return "baixo";
  return "ok";
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
