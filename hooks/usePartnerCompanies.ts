"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { partnerCompanyService } from "@/services/partner-company.service";
import type {
  CreatePartnerCompanyPayload,
  PartnerCompany,
  UpdatePartnerCompanyPayload,
} from "@/types/partner-company.types";

export function usePartnerCompanies(barbershopId: string | undefined) {
  const [companies, setCompanies] = useState<PartnerCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await partnerCompanyService.list(barbershopId);
      setCompanies(data);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Falha ao carregar empresas parceiras.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: CreatePartnerCompanyPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await partnerCompanyService.create(
          barbershopId,
          payload,
        );
        setCompanies((prev) => [created, ...prev]);
        toast.success("Empresa parceira cadastrada.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao cadastrar empresa parceira.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdatePartnerCompanyPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await partnerCompanyService.update(
          barbershopId,
          id,
          payload,
        );
        setCompanies((prev) => prev.map((c) => (c.id === id ? updated : c)));
        toast.success("Empresa parceira atualizada.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao atualizar empresa parceira.",
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
        await partnerCompanyService.remove(barbershopId, id);
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        toast.success("Empresa parceira removida.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao remover empresa parceira.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { companies, isLoading, refresh, create, update, remove };
}
