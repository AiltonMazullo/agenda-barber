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
    form.append("image", payload.file);
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
    if (payload.file) form.append("image", payload.file);
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
