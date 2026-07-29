import { api } from "@/lib/api";
import type {
  ClubBanner,
  CreateClubBannerPayload,
  UpdateClubBannerPayload,
} from "@/types/club-banner.types";

export const clubBannerService = {
  async list(barbershopId: string): Promise<ClubBanner[]> {
    const { data } = await api.get<ClubBanner[]>(
      `/barbershops/${barbershopId}/club-banners`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateClubBannerPayload,
  ): Promise<ClubBanner> {
    const form = new FormData();
    form.append("fileName", payload.fileName);
    if (payload.linkUrl) form.append("linkUrl", payload.linkUrl);
    if (payload.image1) form.append("image1", payload.image1);
    if (payload.image2) form.append("image2", payload.image2);
    if (payload.image3) form.append("image3", payload.image3);
    const { data } = await api.post<ClubBanner>(
      `/barbershops/${barbershopId}/club-banners`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateClubBannerPayload,
  ): Promise<ClubBanner> {
    const form = new FormData();
    if (payload.fileName !== undefined) form.append("fileName", payload.fileName);
    if (payload.linkUrl !== undefined) form.append("linkUrl", payload.linkUrl);
    if (payload.image1) form.append("image1", payload.image1);
    if (payload.image2) form.append("image2", payload.image2);
    if (payload.image3) form.append("image3", payload.image3);
    if (payload.removeImage1) form.append("removeImage1", "true");
    if (payload.removeImage2) form.append("removeImage2", "true");
    if (payload.removeImage3) form.append("removeImage3", "true");
    const { data } = await api.put<ClubBanner>(
      `/barbershops/${barbershopId}/club-banners/${id}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/club-banners/${id}`);
  },
};
