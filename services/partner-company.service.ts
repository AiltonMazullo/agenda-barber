import { api } from "@/lib/api";
import type {
  Coupon,
  CouponUsage,
  CreateCouponPayload,
  CreatePartnerCompanyPayload,
  PartnerCompany,
  UpdatePartnerCompanyPayload,
} from "@/types/partner-company.types";

export const partnerCompanyService = {
  async list(barbershopId: string): Promise<PartnerCompany[]> {
    const { data } = await api.get<PartnerCompany[]>(
      `/barbershops/${barbershopId}/partner-companies`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreatePartnerCompanyPayload,
  ): Promise<PartnerCompany> {
    const { data } = await api.post<PartnerCompany>(
      `/barbershops/${barbershopId}/partner-companies`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdatePartnerCompanyPayload,
  ): Promise<PartnerCompany> {
    const { data } = await api.put<PartnerCompany>(
      `/barbershops/${barbershopId}/partner-companies/${id}`,
      payload,
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
