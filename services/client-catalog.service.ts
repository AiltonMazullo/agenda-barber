import { clientApi } from "@/lib/client-api";
import type { Service } from "@/types/service.types";
import type { Employee } from "@/types/employee.types";

/**
 * Catálogo (serviços + profissionais) consumido no fluxo do cliente final.
 * Usa `clientApi` (token do cliente) — no `/agendar` o cliente está sempre
 * autenticado. As rotas são públicas, então funcionam com ou sem token.
 */
export const clientCatalogService = {
  async listServices(barbershopId: string): Promise<Service[]> {
    const { data } = await clientApi.get<Service[]>(
      `/barbershops/${barbershopId}/services`,
    );
    return data;
  },

  async listEmployees(barbershopId: string): Promise<Employee[]> {
    const { data } = await clientApi.get<Employee[]>(
      `/barbershops/${barbershopId}/employees`,
    );
    return data;
  },
};
