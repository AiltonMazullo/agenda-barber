import { clientApi } from "@/lib/client-api";
import type { Service } from "@/types/service.types";
import type { Employee } from "@/types/employee.types";
import type { Branch } from "@/types/branch.types";

/**
 * Catálogo (filiais + serviços + profissionais) do fluxo de agendamento do
 * cliente. Usa `clientApi` — no `/agendar` o cliente está sempre autenticado
 * (middleware exige `sm_client_token`), então enviamos o token dele, que é a
 * credencial válida para ler esses recursos.
 */
export const clientCatalogService = {
  async listBranches(barbershopId: string): Promise<Branch[]> {
    const { data } = await clientApi.get<Branch[]>(
      `/barbershops/${barbershopId}`,
    );
    return data;
  },

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
