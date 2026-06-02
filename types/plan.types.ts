/**
 * Planos que a barbearia oferece aos clientes (assinaturas/pacotes).
 *
 * Esqueleto provisório — os nomes dos campos serão confirmados quando o
 * backend disponibilizar as rotas de planos.
 */

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  /** Ciclo de cobrança (ex.: "MONTHLY", "QUARTERLY", "YEARLY"). */
  interval: string;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPayload {
  name: string;
  description?: string;
  priceInCents: number;
  interval: string;
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string;
  priceInCents?: number;
  interval?: string;
}
