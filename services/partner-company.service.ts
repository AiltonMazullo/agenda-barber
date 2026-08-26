import { api } from "@/lib/api";
import type {
  Coupon,
  CouponUsage,
  CreateCouponPayload,
  CreatePartnerCompanyPayload,
  PartnerCompany,
  UpdateCouponPayload,
  UpdatePartnerCompanyPayload,
} from "@/types/partner-company.types";

/** Monta o FormData de "Dados" + "Redes Sociais" (compartilhado por create/update). */
function appendDetails(
  form: FormData,
  payload: CreatePartnerCompanyPayload | UpdatePartnerCompanyPayload,
) {
  const fields: (keyof typeof payload)[] = [
    "cnpj",
    "email",
    "phone",
    "zipCode",
    "address",
    "number",
    "complement",
    "neighborhood",
    "state",
    "city",
    "category",
    "website",
    "facebookUsername",
    "facebookUrl",
    "instagramUsername",
    "instagramUrl",
  ];
  for (const field of fields) {
    const value = payload[field];
    if (value !== undefined) form.append(field, String(value));
  }
  if (payload.featured !== undefined) form.append("featured", String(payload.featured));
  if (payload.logo) form.append("logo", payload.logo);
}

export const partnerCompanyService = {
  async list(barbershopId: string): Promise<PartnerCompany[]> {
    const { data } = await api.get<PartnerCompany[]>(
      `/barbershops/${barbershopId}/partner-companies`,
    );
    return data;
  },

  async getById(barbershopId: string, id: string): Promise<PartnerCompany> {
    const companies = await this.list(barbershopId);
    const company = companies.find((c) => c.id === id);
    if (!company) throw new Error("Empresa parceira não encontrada.");
    return company;
  },

  async create(
    barbershopId: string,
    payload: CreatePartnerCompanyPayload,
  ): Promise<PartnerCompany> {
    const form = new FormData();
    form.append("name", payload.name);
    if (payload.status) form.append("status", payload.status);
    appendDetails(form, payload);
    const { data } = await api.post<PartnerCompany>(
      `/barbershops/${barbershopId}/partner-companies`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdatePartnerCompanyPayload,
  ): Promise<PartnerCompany> {
    const form = new FormData();
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.status) form.append("status", payload.status);
    appendDetails(form, payload);
    if (payload.removeLogo) form.append("removeLogo", "true");
    const { data } = await api.put<PartnerCompany>(
      `/barbershops/${barbershopId}/partner-companies/${id}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(
      `/barbershops/${barbershopId}/partner-companies/${id}`,
    );
  },

  // ─── Cupons ───────────────────────────────────────────────────────────────

  async listCoupons(
    barbershopId: string,
    partnerCompanyId: string,
  ): Promise<Coupon[]> {
    const { data } = await api.get<Coupon[]>(
      `/barbershops/${barbershopId}/partner-companies/${partnerCompanyId}/coupons`,
    );
    return data;
  },

  async createCoupon(
    barbershopId: string,
    partnerCompanyId: string,
    payload: CreateCouponPayload,
  ): Promise<Coupon> {
    const { data } = await api.post<Coupon>(
      `/barbershops/${barbershopId}/partner-companies/${partnerCompanyId}/coupons`,
      payload,
    );
    return data;
  },

  async updateCoupon(
    barbershopId: string,
    couponId: string,
    payload: UpdateCouponPayload,
  ): Promise<Coupon> {
    const { data } = await api.put<Coupon>(
      `/barbershops/${barbershopId}/partner-companies/coupons/${couponId}`,
      payload,
    );
    return data;
  },

  async markCouponUsed(barbershopId: string, couponId: string): Promise<Coupon> {
    const { data } = await api.patch<Coupon>(
      `/barbershops/${barbershopId}/partner-companies/coupons/${couponId}/use`,
    );
    return data;
  },

  async removeCoupon(barbershopId: string, couponId: string): Promise<void> {
    await api.delete<void>(
      `/barbershops/${barbershopId}/partner-companies/coupons/${couponId}`,
    );
  },

  /** Cupons já utilizados — opcionalmente filtrados por empresa parceira. */
  async couponUsage(
    barbershopId: string,
    partnerCompanyId?: string,
  ): Promise<CouponUsage[]> {
    const { data } = await api.get<CouponUsage[]>(
      `/barbershops/${barbershopId}/partner-companies/coupons/usage`,
      { params: partnerCompanyId ? { partnerCompanyId } : undefined },
    );
    return data;
  },
};
