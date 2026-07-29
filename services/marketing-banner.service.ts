import { api } from "@/lib/api";
import type {
  CreateMarketingBannerPayload,
  MarketingBanner,
  UpdateMarketingBannerPayload,
} from "@/types/marketing-banner.types";

export const marketingBannerService = {
  async list(barbershopId: string): Promise<MarketingBanner[]> {
    const { data } = await api.get<MarketingBanner[]>(
      `/barbershops/${barbershopId}/marketing-banners`,
    );
    return data;
  },

  /** Rota pública (sem auth) — usada na home do cliente. */
  async listPublic(barbershopId: string): Promise<MarketingBanner[]> {
    const { data } = await api.get<MarketingBanner[]>(
      `/barbershops/${barbershopId}/marketing-banners/public`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateMarketingBannerPayload,
  ): Promise<MarketingBanner> {
    const form = new FormData();
    form.append("name", payload.name);
    if (payload.linkUrl) form.append("linkUrl", payload.linkUrl);
    if (payload.image1) form.append("image1", payload.image1);
    if (payload.image2) form.append("image2", payload.image2);
    if (payload.image3) form.append("image3", payload.image3);
    const { data } = await api.post<MarketingBanner>(
      `/barbershops/${barbershopId}/marketing-banners`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateMarketingBannerPayload,
  ): Promise<MarketingBanner> {
    const form = new FormData();
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.linkUrl !== undefined) form.append("linkUrl", payload.linkUrl);
    if (payload.image1) form.append("image1", payload.image1);
    if (payload.image2) form.append("image2", payload.image2);
    if (payload.image3) form.append("image3", payload.image3);
    if (payload.removeImage1) form.append("removeImage1", "true");
    if (payload.removeImage2) form.append("removeImage2", "true");
    if (payload.removeImage3) form.append("removeImage3", "true");
    const { data } = await api.put<MarketingBanner>(
      `/barbershops/${barbershopId}/marketing-banners/${id}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(
      `/barbershops/${barbershopId}/marketing-banners/${id}`,
    );
  },
};
