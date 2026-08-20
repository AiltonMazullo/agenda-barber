/** Tipos espelhando os modelos `PartnerCompany` e `Coupon` do backend. */

export type PartnerCompanyStatus = "ACTIVE" | "INACTIVE";

export interface PartnerCompany {
  id: string;
  barbershopId: string;
  name: string;
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
