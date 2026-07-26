"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { partnerCompanyService } from "@/services/partner-company.service";
import type { CouponUsage } from "@/types/partner-company.types";

/** Relatório de cupons utilizados — busca sob demanda (botão "Filtrar"). */
export function useCouponUsage(barbershopId: string | undefined) {
  const [usage, setUsage] = useState<CouponUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(
    async (partnerCompanyId?: string) => {
      if (!barbershopId) return;
      setIsLoading(true);
      try {
        const data = await partnerCompanyService.couponUsage(
          barbershopId,
          partnerCompanyId,
        );
        setUsage(data);
        setHasSearched(true);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao carregar utilização dos cupons.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [barbershopId],
  );

  return { usage, isLoading, hasSearched, search };
}
