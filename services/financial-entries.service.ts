import { api } from "@/lib/api";
import type {
  CreateFinancialEntryPayload,
  FinancialBalance,
  FinancialEntry,
  FinancialEntryFilters,
  GenerateCommissionsPayload,
  GenerateCommissionsResult,
  UpdateFinancialEntryPayload,
} from "@/types/financial-entry.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/financial-entries`;

export const financialEntriesService = {
  /**
   * spec-ajustes-escopo-2 §2.4: sem `page`/`pageSize`, o backend responde
   * `total: null` e `data` com a lista inteira (compat com quem ainda não
   * pagina). Mesmo padrão já usado em `comandas.service.ts`.
   */
  async list(
    barbershopId: string,
    filters: FinancialEntryFilters = {},
    pagination?: { page: number; pageSize: number },
  ): Promise<{ data: FinancialEntry[]; total: number | null }> {
    const { categoryIds, ...rest } = filters;
    const { data } = await api.get<{ data: FinancialEntry[]; total: number | null }>(
      base(barbershopId),
      {
        params: {
          ...rest,
          categoryIds: categoryIds?.length ? categoryIds.join(",") : undefined,
          ...pagination,
        },
      },
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateFinancialEntryPayload,
  ): Promise<FinancialEntry> {
    const { data } = await api.post<FinancialEntry>(base(barbershopId), payload);
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateFinancialEntryPayload,
  ): Promise<FinancialEntry> {
    const { data } = await api.patch<FinancialEntry>(`${base(barbershopId)}/${id}`, payload);
    return data;
  },

  async markPaid(barbershopId: string, id: string): Promise<FinancialEntry> {
    const { data } = await api.patch<FinancialEntry>(`${base(barbershopId)}/${id}/mark-paid`);
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },

  async getBalance(
    barbershopId: string,
    filters: {
      branchId?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
      description?: string;
      categoryIds?: string[];
    } = {},
  ): Promise<FinancialBalance> {
    const { categoryIds, ...rest } = filters;
    const { data } = await api.get<FinancialBalance>(`${base(barbershopId)}/balance`, {
      params: { ...rest, categoryIds: categoryIds?.length ? categoryIds.join(",") : undefined },
    });
    return data;
  },

  async generateCommissions(
    barbershopId: string,
    payload: GenerateCommissionsPayload,
  ): Promise<GenerateCommissionsResult> {
    const { data } = await api.post<GenerateCommissionsResult>(
      `${base(barbershopId)}/generate-commissions`,
      payload,
    );
    return data;
  },
};
