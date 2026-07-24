"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { subscriptionsService } from "@/services/subscriptions.service";
import type { Subscription } from "@/types/subscription.types";
import type { CancelReasonCode } from "@/types/pre-cancelled-client.types";

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function useSubscriptions(barbershopId: string | undefined) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await subscriptionsService.list(barbershopId);
      setSubscriptions(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar assinaturas.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchSubscriptions();
  }, [barbershopId, fetchSubscriptions]);

  const cancel = useCallback(
    async (id: string, reason?: CancelReasonCode) => {
      if (!barbershopId) return false;
      try {
        await subscriptionsService.cancel(barbershopId, id, reason);
        toast.success("Assinatura cancelada.");
        await fetchSubscriptions();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao cancelar assinatura.");
        return false;
      }
    },
    [barbershopId, fetchSubscriptions],
  );

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.status === "ACTIVE"),
    [subscriptions],
  );

  const summary = useMemo(() => {
    const monthStart = startOfMonth();
    const activeCount = activeSubscriptions.length;
    const cancelledCount = subscriptions.filter((s) => s.status === "CANCELLED").length;
    const newThisMonth = subscriptions.filter(
      (s) => new Date(s.createdAt) >= monthStart,
    ).length;
    const mrrInCents = activeSubscriptions.reduce(
      (acc, s) => acc + (s.priceOverrideInCents ?? s.plan.priceInCents),
      0,
    );

    const byPlanMap = new Map<
      string,
      { planId: string; planName: string; labelColor: string; count: number }
    >();
    for (const sub of activeSubscriptions) {
      const existing = byPlanMap.get(sub.planId);
      if (existing) {
        existing.count += 1;
      } else {
        byPlanMap.set(sub.planId, {
          planId: sub.planId,
          planName: sub.plan.name,
          labelColor: sub.plan.labelColor,
          count: 1,
        });
      }
    }

    return {
      activeCount,
      cancelledCount,
      newThisMonth,
      mrrInCents,
      byPlan: Array.from(byPlanMap.values()),
    };
  }, [subscriptions, activeSubscriptions]);

  return {
    subscriptions,
    activeSubscriptions,
    summary,
    isLoading,
    cancel,
    refetch: fetchSubscriptions,
  };
}
