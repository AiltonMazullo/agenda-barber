/** Tipos espelhando o modelo `ServicePromotion` do backend. */

export interface ServicePromotion {
  id: string;
  barbershopId: string;
  serviceId: string;
  /** Valor do desconto (inteiro — unidade definida pela regra de negócio, ex.: percentual). */
  discountValue: number;
  /** ISO 8601. */
  startAt: string;
  /** ISO 8601. */
  endAt: string;
  createdAt: string;
}

export interface CreateServicePromotionPayload {
  serviceId: string;
  discountValue: number;
  startAt: string;
  endAt: string;
}

export interface UpdateServicePromotionPayload {
  discountValue?: number;
  startAt?: string;
  endAt?: string;
}
