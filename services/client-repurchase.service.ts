import { api } from "@/lib/api";
import type { ClientRepurchase } from "@/types/client-repurchase.types";

export const clientRepurchaseService = {
  async list(
    barbershopId: string,
    clientId?: string,
  ): Promise<ClientRepurchase[]> {
    const { data } = await api.get<ClientRepurchase[]>(
      `/barbershops/${barbershopId}/client-repurchases`,
      { params: clientId ? { clientId } : undefined },
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(
      `/barbershops/${barbershopId}/client-repurchases/${id}`,
    );
  },
};
