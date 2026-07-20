"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { subscriptionsService } from "@/services/subscriptions.service";
import type {
  SubscriptionBillingType,
  SubscriptionCalendar,
} from "@/types/subscription.types";

export function useSubscriptionCalendar(
  barbershopId: string | undefined,
  month: number,
  year: number,
  type?: SubscriptionBillingType,
) {
  const [calendar, setCalendar] = useState<SubscriptionCalendar>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchCalendar = useCallback(async () => {
    if (!barbershopId) return;
    setIsLoading(true);
    try {
      const data = await subscriptionsService.getCalendar(barbershopId, month, year, type);
      setCalendar(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar calendário.");
    } finally {
      setIsLoading(false);
    }
  }, [barbershopId, month, year, type]);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    fetchCalendar();
  }, [barbershopId, fetchCalendar]);

  return { calendar, isLoading };
}
