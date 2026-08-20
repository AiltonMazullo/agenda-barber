import { clientApi } from "@/lib/client-api";
import type { MyCoupon } from "@/types/partner-company.types";

/** Autoatendimento de cupons do "Clube do Assinante" — cliente logado resgata sozinho. */
export const clientCouponsService = {
  async listMine(barbershopId: string): Promise<MyCoupon[]> {
    const { data } = await clientApi.get<MyCoupon[]>(
      `/barbershops/${barbershopId}/partner-companies/coupons/me`,
    );
    return data;
  },

  async redeem(barbershopId: string, code: string): Promise<MyCoupon> {
    const { data } = await clientApi.post<MyCoupon>(
      `/barbershops/${barbershopId}/partner-companies/coupons/redeem`,
      { code },
    );
    return data;
  },
};
