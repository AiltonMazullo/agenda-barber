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

  async create(
    barbershopId: string,
    payload: CreateMarketingBannerPayload,
  ): Promise<MarketingBanner> {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("image", payload.file);
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
    if (payload.file) form.append("image", payload.file);
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
