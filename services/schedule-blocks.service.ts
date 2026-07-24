import { api } from "@/lib/api";
import type {
  CreateScheduleBlockPayload,
  ScheduleBlock,
} from "@/types/schedule-block.types";

export const scheduleBlocksService = {
  async list(barbershopId: string): Promise<ScheduleBlock[]> {
    const { data } = await api.get<ScheduleBlock[]>(
      `/barbershops/${barbershopId}/schedule-blocks`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateScheduleBlockPayload,
  ): Promise<ScheduleBlock> {
    const { data } = await api.post<ScheduleBlock>(
      `/barbershops/${barbershopId}/schedule-blocks`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(
      `/barbershops/${barbershopId}/schedule-blocks/${id}`,
    );
  },
};
