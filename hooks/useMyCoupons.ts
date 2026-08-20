"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { clientCouponsService } from "@/services/client-coupons.service";
import type { MyCoupon } from "@/types/partner-company.types";

/** Cupons do cliente logado — lista + resgate por código (Clube do Assinante). */
export function useMyCoupons(barbershopId: string | undefined) {
  const [coupons, setCoupons] = useState<MyCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const refresh = useCallback(async () => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await clientCouponsService.listMine(barbershopId);
      setCoupons(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar seus cupons.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const redeem = useCallback(
    async (code: string) => {
      if (!barbershopId) return null;
      setIsRedeeming(true);
      try {
        const redeemed = await clientCouponsService.redeem(barbershopId, code);
        setCoupons((prev) => [
          redeemed,
          ...prev.filter((c) => c.id !== redeemed.id),
        ]);
        toast.success("Cupom resgatado com sucesso!");
        return redeemed;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível resgatar o cupom.",
        );
        return null;
      } finally {
        setIsRedeeming(false);
      }
    },
    [barbershopId],
  );

  return { coupons, isLoading, isRedeeming, refresh, redeem };
}
