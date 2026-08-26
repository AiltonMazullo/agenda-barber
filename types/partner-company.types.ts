/** Tipos espelhando os modelos `PartnerCompany` e `Coupon` do backend. */

export type PartnerCompanyStatus = "ACTIVE" | "INACTIVE";

export interface PartnerCompany {
  id: string;
  barbershopId: string;
  name: string;
  /**
   * Gerado a partir do nome na criação — identifica o link público
   * `/parceiro/:slug`. `null` só em empresas cadastradas antes deste campo
   * existir; toda empresa nova sempre recebe um.
   */
  slug: string | null;
  status: PartnerCompanyStatus;
  // Dados — todos opcionais no banco (registros antigos não têm valor).
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  zipCode: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  state: string | null;
  city: string | null;
  category: string | null;
  featured: boolean;
  logoUrl: string | null;
  // Redes sociais
  website: string | null;
  facebookUsername: string | null;
  facebookUrl: string | null;
  instagramUsername: string | null;
  instagramUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Campos de "Dados" + "Redes Sociais" — compartilhados entre criar/editar. */
export interface PartnerCompanyDetails {
  cnpj?: string;
  email?: string;
  phone?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  state?: string;
  city?: string;
  category?: string;
  featured?: boolean;
  website?: string;
  facebookUsername?: string;
  facebookUrl?: string;
  instagramUsername?: string;
  instagramUrl?: string;
}

export interface CreatePartnerCompanyPayload extends PartnerCompanyDetails {
  name: string;
  status?: PartnerCompanyStatus;
  logo?: File;
}

export interface UpdatePartnerCompanyPayload extends PartnerCompanyDetails {
  name?: string;
  status?: PartnerCompanyStatus;
  logo?: File;
  removeLogo?: boolean;
}

export interface Coupon {
  id: string;
  partnerCompanyId: string;
  /** Nome da promoção — opcional no banco (cupons cadastrados antes deste campo existir). */
  name: string | null;
  code: string;
  /** Percentual de desconto (ex.: "15"). */
  discount: string;
  description: string | null;
  expiresAt: string | null;
  clientId: string | null;
  usedAt: string | null;
  createdAt: string;
}

export interface CreateCouponPayload {
  name: string;
  code: string;
  discount: string;
  description: string;
  expiresAt?: string;
  clientId?: string;
}

export interface UpdateCouponPayload {
  name?: string;
  code?: string;
  discount?: string;
  description?: string;
  expiresAt?: string;
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
