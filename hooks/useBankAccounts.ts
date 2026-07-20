"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { bankAccountsService } from "@/services/bank-accounts.service";
import type {
  BankAccount,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
} from "@/types/bank-account.types";

export function useBankAccounts(barbershopId: string | undefined) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await bankAccountsService.list(barbershopId);
      setAccounts(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar contas bancárias.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchAccounts();
  }, [barbershopId, fetchAccounts]);

  const create = useCallback(
    async (payload: CreateBankAccountPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await bankAccountsService.create(barbershopId, payload);
        toast.success("Conta bancária cadastrada.");
        await fetchAccounts();
        return created;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao cadastrar conta.");
        return null;
      }
    },
    [barbershopId, fetchAccounts],
  );

  const update = useCallback(
    async (id: string, payload: UpdateBankAccountPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await bankAccountsService.update(barbershopId, id, payload);
        toast.success("Conta bancária atualizada.");
        await fetchAccounts();
        return updated;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao atualizar conta.");
        return null;
      }
    },
    [barbershopId, fetchAccounts],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await bankAccountsService.remove(barbershopId, id);
        toast.success("Conta bancária removida.");
        await fetchAccounts();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao remover conta.");
        return false;
      }
    },
    [barbershopId, fetchAccounts],
  );

  return { accounts, isLoading, create, update, remove };
}
