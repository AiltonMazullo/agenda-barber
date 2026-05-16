"use client";

import { useCallback, useState } from "react";

/**
 * Estado de notificações exibido no Header.
 *
 * Por ora, mantém apenas um sinal "tem não-lida" controlado localmente.
 * Quando o backend publicar `/notifications`, substituir o estado interno
 * por um fetch + websocket sem mudar a assinatura.
 */
export function useNotifications() {
  const [hasUnread, setHasUnread] = useState(true);

  const markAsRead = useCallback(() => setHasUnread(false), []);

  return { hasUnread, markAsRead };
}
