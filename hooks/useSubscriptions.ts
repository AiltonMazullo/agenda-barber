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
  // Inadimplentes (§4.2) — reaproveita o `contractStatus` já calculado pelo
  // endpoint de contratos (última cobrança OVERDUE, ou PENDING já vencida),
  // em vez de duplicar essa regra no frontend.
  const [overdueIds, setOverdueIds] = useState<Set<string>>(new Set());
  const [overdueAmountInCents, setOverdueAmountInCents] = useState(0);

  const fetchSubscriptions = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const [data, overdue] = await Promise.all([
        subscriptionsService.list(barbershopId),
        subscriptionsService.getContracts(barbershopId, { status: "ATRASADO" }),
      ]);
      setSubscriptions(data);
      setOverdueIds(new Set(overdue.contracts.map((c) => c.id)));
      setOverdueAmountInCents(overdue.totals.total);
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
      overdueCount: overdueIds.size,
      overdueAmountInCents,
      overdueSubscriptionIds: overdueIds,
      byPlan: Array.from(byPlanMap.values()),
    };
  }, [subscriptions, activeSubscriptions, overdueIds, overdueAmountInCents]);

  return {
    subscriptions,
    activeSubscriptions,
    summary,
    isLoading,
    cancel,
    refetch: fetchSubscriptions,
  };
}
