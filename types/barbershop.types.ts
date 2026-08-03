import type { Service } from "@/types/service.types";
import type { Employee } from "@/types/employee.types";
import type { Branch } from "@/types/branch.types";
import type { Holiday } from "@/types/holiday.types";

export type PersonType = "FISICA" | "JURIDICA";

export type ValeDeductionSource =
  | "TODOS"
  | "SERVICOS_AVULSOS"
  | "SERVICOS_ASSINATURA"
  | "PRODUTOS";

export type CommissionUnitType = "FICHA" | "MINUTO";

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
  /** Categoria do negócio (BARBEARIA | SALAO | MANICURE | SPA). Filtro da vitrine pública. */
  category?: string | null;
  /** Coordenadas p/ busca por geolocalização — `null` quando ainda não geocodificado. */
  latitude?: number | null;
  longitude?: number | null;
  /** Distância até a posição do usuário (km), preenchida só quando `?lat=&lng=` é enviado na busca. */
  distanceKm?: number | null;
  // ─── Regras de tolerância/penalidade, Clube da Barba, Dpote e Financeiro ──
  cancellationToleranceMinutes?: number | null;
  penaltyDurationHours?: number | null;
  clubName?: string | null;
  dpoteCommissionPercent?: number | null;
  hideFichaFromBarberReport?: boolean;
  commissionUnitType?: CommissionUnitType;
  valeDeductionSource?: ValeDeductionSource;
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
  category?: string | null;
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
  category?: string | null;
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
  cancellationToleranceMinutes?: number | null;
  penaltyDurationHours?: number | null;
  clubName?: string | null;
  dpoteCommissionPercent?: number | null;
  hideFichaFromBarberReport?: boolean;
  commissionUnitType?: CommissionUnitType;
  valeDeductionSource?: ValeDeductionSource;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
