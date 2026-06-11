/**
 * Tipos espelhando o modelo `Service` do backend.
 * Preço sempre em centavos (inteiro).
 */

export interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceInCents: number;
  hex: string | null;
  /** Serviço marcado como destaque (aparece primeiro e com badge "Em alta"). */
  featured: boolean;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  durationMin: number;
  priceInCents: number;
  hex?: string;
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  durationMin?: number;
  priceInCents?: number;
  hex?: string;
}
