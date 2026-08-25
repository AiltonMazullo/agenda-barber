/** Tipos espelhando os modelos `PartnerCompany` e `Coupon` do backend. */

export type PartnerCompanyStatus = "ACTIVE" | "INACTIVE";

export interface PartnerCompany {
  id: string;
  barbershopId: string;
  name: string;
  /** Gerado a partir do nome na criação — identifica o link público `/parceiro/:slug`. */
  slug: string;
  status: PartnerCompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerCompanyPayload {
  name: string;
  status?: PartnerCompanyStatus;
}

export interface UpdatePartnerCompanyPayload {
  name?: string;
  status?: PartnerCompanyStatus;
}

export interface Coupon {
  id: string;
  partnerCompanyId: string;
  code: string;
  discount: string;
  clientId: string | null;
  usedAt: string | null;
  createdAt: string;
}

export interface CreateCouponPayload {
  code: string;
  discount: string;
  clientId?: string;
}

/** Retorno de `GET /partner-companies/coupons/usage` — cupom já utilizado, com a empresa parceira embutida. */
export interface CouponUsage extends Coupon {
  partnerCompany: PartnerCompany;
}

/** Cupom do cliente final (autoatendimento) — sempre com a empresa parceira embutida. */
export interface MyCoupon extends Coupon {
  partnerCompany: PartnerCompany;
}

/** Um cupom já resgatado, como visto no link público `/parceiro/:slug` (sem auth). */
export interface PublicCouponUsage {
  id: string;
  code: string;
  discount: string;
  usedAt: string | null;
  createdAt: string;
  client: { id: string; name: string } | null;
}

/** Retorno de `GET /partner-companies/public/:slug`. */
export interface PublicPartnerCompanyCoupons {
  company: { id: string; name: string };
  coupons: PublicCouponUsage[];
}
