/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cashRegistersService } from "@/services/cash-registers.service";
import type {
  AddTransactionsPayload,
  CashRegister,
} from "@/types/cash-register.types";

export function useCashRegisters(barbershopId: string | undefined) {
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    cashRegistersService
      .list(barbershopId)
      .then((data) => {
        if (active) setRegisters(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar caixas.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  const create = useCallback(
    async (branchId: string) => {
      if (!barbershopId) return null;
      try {
        const created = await cashRegistersService.create(barbershopId, {
          branchId,
        });
        setRegisters((prev) => [created, ...prev]);
        toast.success("Caixa aberto.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao abrir caixa.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  /**
   * Busca o detalhe (com transações) de um caixa e actualiza o item na lista
   * para que o CaixaCard exiba o resumo (abertura/entradas/total) sem nova
   * requisição.
   */
  const getById = useCallback(
    async (id: string) => {
      if (!barbershopId) return null;
      try {
        const full = await cashRegistersService.getById(barbershopId, id);
        if (full) {
          setRegisters((prev) =>
            prev.map((r) => (r.id === id ? { ...r, transactions: full.transactions } : r)),
          );
        }
        return full;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar o caixa.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const addTransactions = useCallback(
    async (id: string, payload: AddTransactionsPayload) => {
      if (!barbershopId) return null;
      try {
        const res = await cashRegistersService.addTransactions(
          barbershopId,
          id,
          payload,
        );
        toast.success(
          res.count === 1
            ? "Movimentação adicionada."
            : `${res.count} movimentações adicionadas.`,
        );
        return res;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao adicionar movimentação.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const close = useCallback(
    async (id: string) => {
      if (!barbershopId) return null;
      try {
        const closed = await cashRegistersService.close(barbershopId, id);
        setRegisters((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, closedAt: closed.closedAt } : r,
          ),
        );
        toast.success("Caixa fechado.");
        return closed;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao fechar caixa.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await cashRegistersService.remove(barbershopId, id);
        setRegisters((prev) => prev.filter((r) => r.id !== id));
        toast.success("Caixa excluído.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao excluir caixa.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return {
    registers,
    isLoading,
    create,
    getById,
    addTransactions,
    close,
    remove,
  };
}
