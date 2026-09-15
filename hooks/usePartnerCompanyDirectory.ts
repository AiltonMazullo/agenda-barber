"use client";

import { useCallback, useEffect, useState } from "react";
import { clientCouponsService } from "@/services/client-coupons.service";
import type { PartnerCompanyDirectoryEntry } from "@/types/partner-company.types";

/**
 * Catálogo de empresas parceiras ativas, pro cliente descobrir quem são
 * (spec-ajustes-escopo-5.md §7) — antes ele só via o nome de uma parceira
 * depois de já ter resgatado um cupom dela; não tinha como saber quais
 * empresas existem antes de ter um código em mãos.
 */
export function usePartnerCompanyDirectory(barbershopId: string | undefined) {
  const [companies, setCompanies] = useState<PartnerCompanyDirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await clientCouponsService.listDirectory(barbershopId);
      setCompanies(data);
    } catch {
      // silencioso — o catálogo é complemento da tela de cupons
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { companies, isLoading, refresh };
}
