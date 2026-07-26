/**
 * Tipos de movimentação de estoque (entradas, saídas e vendas). Persistidas
 * no backend (`stock-movements`), com auditoria real (funcionário/dono
 * logado que registrou a movimentação).
 */

export type StockMovementType = "ENTRADA" | "SAIDA" | "VENDA";

/** Resposta crua da API. */
export interface StockMovementApiResponse {
  id: string;
  type: StockMovementType;
  quantity: number;
  unitCostInCents?: number | null;
  unitPriceInCents?: number | null;
  note?: string | null;
  productId: string;
  branchId?: string | null;
  employeeId?: string | null;
  barbershopId: string;
  createdAt: string;
  product: { id: string; name: string };
  branch: { id: string; name: string } | null;
  employee: { id: string; name: string } | null;
}

export interface StockMovement {
  id: string;
  productId: string;
  /** Nome do produto (auditoria). */
  productName: string;
  branchId: string;
  /** Nome da filial (auditoria). */
  branchName: string;
  type: StockMovementType;
  /** Unidades movimentadas (sempre positivo). */
  quantity: number;
  /** Custo unitário em centavos (entradas). */
  unitCostInCents?: number;
  /** Preço unitário de venda em centavos (vendas). */
  unitPriceInCents?: number;
  note?: string;
  /** Quem registrou a movimentação — nome do funcionário ou "Dono". */
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

/** Item de uma movimentação em lote (`POST .../stock-movements/batch`). */
export interface NewStockMovementBatchItem {
  productId: string;
  type: StockMovementType;
  quantity: number;
  unitCostInCents?: number;
  unitPriceInCents?: number;
  note?: string;
}

export interface NewStockMovementBatchInput {
  branchId?: string;
  items: NewStockMovementBatchItem[];
}
