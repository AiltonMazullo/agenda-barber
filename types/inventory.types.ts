/**
 * Tipos da camada **local** de estoque (movimentações e auditoria).
 *
 * O backend só expõe o estoque agregado por filial (`ProductStock`) e o
 * `upsertStock`. Não há endpoint de movimentações/histórico, então registramos
 * entradas, saídas e vendas no frontend (localStorage) — sempre sincronizando o
 * estoque real através do `upsertStock` existente.
 */

export type StockMovementType = "ENTRADA" | "SAIDA" | "VENDA";

export interface StockMovement {
  id: string;
  productId: string;
  /** Snapshot do nome do produto no momento do registro (auditoria). */
  productName: string;
  branchId: string;
  /** Snapshot do nome da filial no momento do registro (auditoria). */
  branchName: string;
  type: StockMovementType;
  /** Unidades movimentadas (sempre positivo). */
  quantity: number;
  /** Custo unitário em centavos (entradas). */
  unitCostInCents?: number;
  /** Preço unitário de venda em centavos (vendas). */
  unitPriceInCents?: number;
  note?: string;
  /** Quem registrou a movimentação (auditoria). */
  user: string;
  /** Data/hora ISO do registro. */
  createdAt: string;
}

export interface NewStockMovementInput {
  productId: string;
  branchId: string;
  type: StockMovementType;
  quantity: number;
  unitCostInCents?: number;
  unitPriceInCents?: number;
  note?: string;
}
