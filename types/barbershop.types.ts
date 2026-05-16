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
}
