/**
 * Tipos espelhando o modelo `Service` do backend.
 * Preço sempre em centavos (inteiro).
 */

export interface ServiceCategory {
  id: string;
  name: string;
}

export type ServiceStatus = "ACTIVE" | "INACTIVE";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceInCents: number;
  hex: string | null;
  /** Serviço marcado como destaque (aparece primeiro e com badge "Em alta"). */
  featured: boolean;
  categoryId: string | null;
  category: ServiceCategory | null;
  barbershopId: string;
  status: ServiceStatus;
  /** Valor em fichas equivalente a este serviço (controle de recompensas). */
  fichaValue: number | null;
  /** Período para recompra sugerido, em dias. */
  repurchasePeriodDays: number | null;
  /** Exibe o preço como "a partir de". */
  startingFrom: boolean;
  /** Serviço oculto (não aparece em seleções públicas). */
  hidden: boolean;
  /** Serviço de encaixe (pode ser encaixado na agenda). */
  fitIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  durationMin: number;
  priceInCents: number;
  hex?: string;
  categoryId?: string | null;
  status?: ServiceStatus;
  fichaValue?: number | null;
  repurchasePeriodDays?: number | null;
  startingFrom?: boolean;
  hidden?: boolean;
  fitIn?: boolean;
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  durationMin?: number;
  priceInCents?: number;
  hex?: string;
  categoryId?: string | null;
  status?: ServiceStatus;
  fichaValue?: number | null;
  repurchasePeriodDays?: number | null;
  startingFrom?: boolean;
  hidden?: boolean;
  fitIn?: boolean;
}
