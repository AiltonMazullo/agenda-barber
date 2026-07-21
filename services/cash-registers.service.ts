import { api } from "@/lib/api";
import type {
  AddTransactionsPayload,
  CashRegister,
  CashRegisterClosingSummary,
  ClosePayload,
  CreateCashRegisterPayload,
  UpdateCashRegisterPayload,
} from "@/types/cash-register.types";

const base = (barbershopId: string) =>
  `/barbershops/${barbershopId}/cash-registers`;

export const cashRegistersService = {
  /** Lista caixas (sem transações). */
  async list(barbershopId: string): Promise<CashRegister[]> {
    const { data } = await api.get<CashRegister[]>(base(barbershopId));
    return data;
  },

  /** Busca um caixa com todas as transações. */
  async getById(barbershopId: string, id: string): Promise<CashRegister> {
    const { data } = await api.get<CashRegister>(`${base(barbershopId)}/${id}`);
    return data;
  },

  /** Abre um novo caixa para uma filial. */
  async create(
    barbershopId: string,
    payload: CreateCashRegisterPayload,
  ): Promise<CashRegister> {
    const { data } = await api.post<CashRegister>(base(barbershopId), payload);
    return data;
  },

  /** Adiciona transações (entradas/saídas) a um caixa aberto. */
  async addTransactions(
    barbershopId: string,
    id: string,
    payload: AddTransactionsPayload,
  ): Promise<{ count: number }> {
    const { data } = await api.patch<{ count: number }>(
      `${base(barbershopId)}/${id}/transactions`,
      payload,
    );
    return data;
  },

  /** Edita metadados do caixa aberto (hoje só a filial vinculada). */
  async update(
    barbershopId: string,
    id: string,
    payload: UpdateCashRegisterPayload,
  ): Promise<CashRegister> {
    const { data } = await api.patch<CashRegister>(
      `${base(barbershopId)}/${id}`,
      payload,
    );
    return data;
  },

  /** Busca o dinheiro esperado e as assinaturas manuais do dia, para a tela de fechamento. */
  async getClosingSummary(
    barbershopId: string,
    id: string,
  ): Promise<CashRegisterClosingSummary> {
    const { data } = await api.get<CashRegisterClosingSummary>(
      `${base(barbershopId)}/${id}/closing-summary`,
    );
    return data;
  },

  /** Fecha o caixa, opcionalmente com a contagem física de dinheiro. */
  async close(
    barbershopId: string,
    id: string,
    payload?: ClosePayload,
  ): Promise<CashRegister> {
    const { data } = await api.patch<CashRegister>(
      `${base(barbershopId)}/${id}/close`,
      payload ?? {},
    );
    return data;
  },

  /** Reabre um caixa fechado. */
  async reopen(barbershopId: string, id: string): Promise<CashRegister> {
    const { data } = await api.patch<CashRegister>(
      `${base(barbershopId)}/${id}/reopen`,
    );
    return data;
  },

  /** Exclui o caixa e todas as transações. */
  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`${base(barbershopId)}/${id}`);
  },
};
