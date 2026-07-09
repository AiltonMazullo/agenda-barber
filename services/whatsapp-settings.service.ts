import { api } from "@/lib/api";
import type {
  UpdateWhatsappSettingsPayload,
  WhatsappSettings,
} from "@/types/whatsapp-settings.types";

export const whatsappSettingsService = {
  async get(barbershopId: string): Promise<WhatsappSettings> {
    const { data } = await api.get<WhatsappSettings>(
      `/barbershops/${barbershopId}/whatsapp-settings`,
    );
    return data;
  },

  async update(
    barbershopId: string,
    payload: UpdateWhatsappSettingsPayload,
  ): Promise<WhatsappSettings> {
    const { data } = await api.put<WhatsappSettings>(
      `/barbershops/${barbershopId}/whatsapp-settings`,
      payload,
    );
    return data;
  },
};
