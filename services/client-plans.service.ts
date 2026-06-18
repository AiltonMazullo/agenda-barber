import { clientApi } from "@/lib/client-api";
import type { Plan } from "@/types/plan.types";

export const clientPlansService = {
  async list(barbershopId: string): Promise<Plan[]> {
    const { data } = await clientApi.get<Plan[]>(
      `/barbershops/${barbershopId}/plans`,
    );
    return data;
  },
};
