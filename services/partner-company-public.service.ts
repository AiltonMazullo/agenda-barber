import { api } from "@/lib/api";
import type { PublicPartnerCompanyCoupons } from "@/types/partner-company.types";

/**
 * Link público da empresa parceira (`/parceiro/:slug`, sem login) — só
 * leitura dos cupons já resgatados, para a empresa validar/conferir.
 */
export const partnerCompanyPublicService = {
  async getBySlug(slug: string): Promise<PublicPartnerCompanyCoupons> {
    const { data } = await api.get<PublicPartnerCompanyCoupons>(
      `/partner-companies/public/${slug}`,
    );
    return data;
  },
};
