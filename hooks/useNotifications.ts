/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationsStore } from "@/lib/notifications-store";
import type { AppNotification } from "@/types/notification.types";

/**
 * Notificações do sino do header (mock local). Expõe a lista e ações para
 * limpar todas ou apenas as selecionadas. Lido em effect para evitar mismatch
 * de hidratação.
 */
export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    setItems(notificationsStore.getAll());
  }, []);

  const clearAll = useCallback(() => {
    notificationsStore.clearAll();
    setItems([]);
  }, []);

  const clearMany = useCallback((ids: string[]) => {
    setItems(notificationsStore.remove(ids));
  }, []);

  return { items, clearAll, clearMany };
}
