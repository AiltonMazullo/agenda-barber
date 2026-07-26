/** Tipos espelhando o modelo `ClientBlock` do backend. */

export interface ClientBlock {
  id: string;
  barbershopId: string;
  clientId: string;
  reason: string;
  /** ISO 8601 — data/hora até quando o bloqueio é válido. */
  blockedUntil: string;
  createdAt: string;
}

export interface CreateClientBlockPayload {
  clientId: string;
  reason: string;
  /** ISO 8601 datetime. */
  blockedUntil: string;
}
