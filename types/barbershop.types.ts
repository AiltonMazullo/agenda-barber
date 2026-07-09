import type { Service } from "@/types/service.types";
import type { Employee } from "@/types/employee.types";
import type { Branch } from "@/types/branch.types";
import type { Holiday } from "@/types/holiday.types";

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
  carouselImages?: string[] | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  /** Categoria do negócio (Barbearia, Salão de Beleza, Manicure…). Filtro da
   * vitrine pública; backend ainda não expõe — quando expuser, o filtro passa
   * a ser estrito automaticamente. */
  category?: string | null;
  createdAt: string;
  updatedAt: string;
  // ─── Relações aninhadas em `GET /barbershops/:slug` (visão do cliente) ────
  // O backend retorna `branches`, `services` e `employees` aninhados aqui.
  // Usadas no fluxo de agendamento do cliente.
  services?: Service[];
  employees?: Employee[];
  branches?: Branch[];
  holidays?: Holiday[];
}

export interface CreateBarbershopFisicaPayload {
  name: string;
  slug: string;
  email: string;
  password: string;
  phone: string;
  personType: "FISICA";
  cpf: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
}

export interface CreateBarbershopJuridicaPayload {
  name: string;
  slug: string;
  email: string;
  password: string;
  phone: string;
  personType: "JURIDICA";
  cnpj: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
}

export type CreateBarbershopPayload =
  | CreateBarbershopFisicaPayload
  | CreateBarbershopJuridicaPayload;

export interface UpdateBarbershopPayload {
  name?: string;
  phone?: string;
  address?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}
