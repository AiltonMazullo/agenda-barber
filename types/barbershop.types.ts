export type PersonType = "FISICA" | "JURIDICA";

export interface Barbershop {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  personType: PersonType;
  cpf: string | null;
  cnpj: string | null;
  // ─── Branding (opcional — backend ainda não expõe estes campos) ──────────
  logoUrl?: string | null;
  bannerUrls?: string[] | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBarbershopFisicaPayload {
  name: string;
  slug: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  personType: "FISICA";
  cpf: string;
}

export interface CreateBarbershopJuridicaPayload {
  name: string;
  slug: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  personType: "JURIDICA";
  cnpj: string;
}

export type CreateBarbershopPayload =
  | CreateBarbershopFisicaPayload
  | CreateBarbershopJuridicaPayload;

export interface UpdateBarbershopPayload {
  name?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  bannerUrls?: string[];
  title?: string;
  subtitle?: string;
  description?: string;
}
