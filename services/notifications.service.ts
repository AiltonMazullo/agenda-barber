import { api } from "@/lib/api";
import type { AppNotification } from "@/types/notification.types";

export const notificationsService = {
  async list(barbershopId: string): Promise<AppNotification[]> {
    const { data } = await api.get<AppNotification[]>(
      `/barbershops/${barbershopId}/notifications`,
    );
    return data;
  },

  async markRead(barbershopId: string, id: string): Promise<void> {
    await api.patch<void>(`/barbershops/${barbershopId}/notifications/${id}/read`);
  },

  async markAllRead(barbershopId: string): Promise<void> {
    await api.patch<void>(`/barbershops/${barbershopId}/notifications/read-all`);
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/notifications/${id}`);
  },

  async removeAll(barbershopId: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/notifications`);
  },
};
