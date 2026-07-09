import { api } from "@/lib/api";
import type {
  Holiday,
  CreateHolidayPayload,
  UpdateHolidayPayload,
} from "@/types/holiday.types";

export const holidaysService = {
  async list(barbershopId: string): Promise<Holiday[]> {
    const { data } = await api.get<Holiday[]>(
      `/barbershops/${barbershopId}/holidays`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateHolidayPayload,
  ): Promise<Holiday> {
    const { data } = await api.post<Holiday>(
      `/barbershops/${barbershopId}/holidays`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateHolidayPayload,
  ): Promise<Holiday> {
    const { data } = await api.put<Holiday>(
      `/barbershops/${barbershopId}/holidays/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/holidays/${id}`);
  },
};
