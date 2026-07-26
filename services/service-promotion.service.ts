import { api } from "@/lib/api";
import type {
  CreateServicePromotionPayload,
  ServicePromotion,
  UpdateServicePromotionPayload,
} from "@/types/service-promotion.types";

export const servicePromotionService = {
  async list(barbershopId: string): Promise<ServicePromotion[]> {
    const { data } = await api.get<ServicePromotion[]>(
      `/barbershops/${barbershopId}/service-promotions`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateServicePromotionPayload,
  ): Promise<ServicePromotion> {
    const { data } = await api.post<ServicePromotion>(
      `/barbershops/${barbershopId}/service-promotions`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateServicePromotionPayload,
  ): Promise<ServicePromotion> {
    const { data } = await api.put<ServicePromotion>(
      `/barbershops/${barbershopId}/service-promotions/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(
      `/barbershops/${barbershopId}/service-promotions/${id}`,
    );
  },
};
