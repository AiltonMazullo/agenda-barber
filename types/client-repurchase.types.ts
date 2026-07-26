/** Tipos espelhando o modelo `ClientRepurchase` do backend (somente leitura/remoção). */

export interface ClientRepurchase {
  id: string;
  barbershopId: string;
  clientId: string;
  serviceId: string | null;
  productId: string | null;
  /** ISO 8601 — data da compra original. */
  purchasedAt: string;
  /** ISO 8601 — data sugerida/estimada de recompra. */
  repurchaseAt: string;
  createdAt: string;
}
