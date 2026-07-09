import { clientApi } from "@/lib/client-api";
import type { Barbershop } from "@/types/barbershop.types";
import type { Service } from "@/types/service.types";
import type { Employee } from "@/types/employee.types";
import type { Branch } from "@/types/branch.types";
import type { Holiday } from "@/types/holiday.types";

/**
 * Catálogo (filiais + serviços + profissionais) do fluxo de agendamento do
 * cliente. A única rota que expõe esses dados para o token de cliente é
 * `GET /barbershops/:slug`, que devolve a barbearia com `branches`, `services`
 * e `employees` aninhados — as rotas dedicadas (/branches, /employees) exigem
 * token de dono e retornam vazio/404 para clientes.
 */
async function fetchBySlug(slug: string): Promise<Barbershop> {
  const { data } = await clientApi.get<Barbershop>(`/barbershops/${slug}`);
  return data;
}

export const clientCatalogService = {
  async listBranches(slug: string): Promise<Branch[]> {
    const shop = await fetchBySlug(slug);
    return shop.branches ?? [];
  },

  async listServices(slug: string): Promise<Service[]> {
    const shop = await fetchBySlug(slug);
    return shop.services ?? [];
  },

  async listEmployees(slug: string): Promise<Employee[]> {
    const shop = await fetchBySlug(slug);
    return shop.employees ?? [];
  },

  /** Busca tudo de uma vez (uma request só). */
  async getCatalog(slug: string): Promise<{
    branches: Branch[];
    services: Service[];
    employees: Employee[];
    holidays: Holiday[];
  }> {
    const shop = await fetchBySlug(slug);
    return {
      branches: shop.branches ?? [],
      services: shop.services ?? [],
      employees: shop.employees ?? [],
      holidays: shop.holidays ?? [],
    };
  },
};
