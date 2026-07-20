/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { notificationsService } from "@/services/notifications.service";
import type { AppNotification } from "@/types/notification.types";

const SYNTHETIC_PREFIX = "today:";

/**
 * Notificações do sino do header. Itens com id prefixado por "today:" são
 * calculados sob demanda pelo backend (ex.: "Agendamentos de hoje") e não
 * existem no banco — marcar como lida/limpar afeta apenas o estado local e
 * o item pode reaparecer no próximo fetch.
 */
export function useNotifications(barbershopId: string | undefined) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    notificationsService
      .list(barbershopId)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar notificações.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  const markAllRead = useCallback(async () => {
    if (!barbershopId) return;
    const hasUnread = items.some((n) => !n.isRead);
    if (!hasUnread) return;
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationsService.markAllRead(barbershopId);
    } catch {
      // silencioso — o estado lido permanece só na UI
    }
  }, [barbershopId, items]);

  const clearAll = useCallback(async () => {
    if (!barbershopId) return;
    setItems([]);
    try {
      await notificationsService.removeAll(barbershopId);
    } catch {
      // silencioso — itens sintéticos voltam no próximo fetch de qualquer forma
    }
  }, [barbershopId]);

  const clearMany = useCallback(
    async (ids: string[]) => {
      if (!barbershopId) return;
      setItems((prev) => prev.filter((n) => !ids.includes(n.id)));
      const realIds = ids.filter((id) => !id.startsWith(SYNTHETIC_PREFIX));
      try {
        await Promise.all(realIds.map((id) => notificationsService.remove(barbershopId, id)));
      } catch {
        // silencioso — estado local já foi atualizado
      }
    },
    [barbershopId],
  );

  return { items, isLoading, markAllRead, clearAll, clearMany };
}
