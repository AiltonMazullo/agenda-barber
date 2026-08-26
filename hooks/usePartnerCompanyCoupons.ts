"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { partnerCompanyService } from "@/services/partner-company.service";
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/partner-company.types";

/** Cupons de uma empresa parceira específica — usado dentro do cadastro dela. */
export function usePartnerCompanyCoupons(
  barbershopId: string | undefined,
  partnerCompanyId: string | undefined,
) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!barbershopId || !partnerCompanyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await partnerCompanyService.listCoupons(
        barbershopId,
        partnerCompanyId,
      );
      setCoupons(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar cupons.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId, partnerCompanyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: CreateCouponPayload) => {
      if (!barbershopId || !partnerCompanyId) return null;
      try {
        const created = await partnerCompanyService.createCoupon(
          barbershopId,
          partnerCompanyId,
          payload,
        );
        setCoupons((prev) => [created, ...prev]);
        toast.success("Promoção adicionada.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao adicionar promoção.",
        );
        return null;
      }
    },
    [barbershopId, partnerCompanyId],
  );

  const update = useCallback(
    async (couponId: string, payload: UpdateCouponPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await partnerCompanyService.updateCoupon(
          barbershopId,
          couponId,
          payload,
        );
        setCoupons((prev) => prev.map((c) => (c.id === couponId ? updated : c)));
        toast.success("Cupom atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar cupom.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const remove = useCallback(
    async (couponId: string) => {
      if (!barbershopId) return false;
      try {
        await partnerCompanyService.removeCoupon(barbershopId, couponId);
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
        toast.success("Cupom removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover cupom.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { coupons, isLoading, refresh, create, update, remove };
}
