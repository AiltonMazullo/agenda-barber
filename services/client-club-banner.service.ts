import { clientApi } from "@/lib/client-api";
import type { ClubBanner } from "@/types/club-banner.types";

/** Banners do clube/assinatura exibidos na área logada do app do cliente. */
export const clientClubBannerService = {
  async listPublic(barbershopId: string): Promise<ClubBanner[]> {
    const { data } = await clientApi.get<ClubBanner[]>(
      `/barbershops/${barbershopId}/club-banners/public`,
    );
    return data;
  },
};
