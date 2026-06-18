/**
 * Store **local** (localStorage) de notificações do dono. Mock até existir a
 * rota de notificações no backend. Vem com alguns itens de exemplo (semeados
 * uma única vez) para demonstrar limpar todas / selecionar; quando esvaziado,
 * o sino mostra o estado "sem notificações".
 */

import type { AppNotification } from "@/types/notification.types";

const KEY = "sm_notifications";
const SEED_FLAG = "sm_notifications_seeded";

function seed(): AppNotification[] {
  const now = Date.now();
  const min = 60 * 1000;
  return [
    {
      id: "n1",
      title: "Novo agendamento",
      message: "Um cliente agendou um horário com a sua equipe.",
      createdAt: new Date(now - 5 * min).toISOString(),
    },
    {
      id: "n2",
      title: "Agendamentos de hoje",
      message: "Você tem horários marcados para hoje. Confira a agenda.",
      createdAt: new Date(now - 2 * 60 * min).toISOString(),
    },
    {
      id: "n3",
      title: "Estoque baixo",
      message: "Um produto está com estoque abaixo do mínimo.",
      createdAt: new Date(now - 26 * 60 * min).toISOString(),
    },
  ];
}

function readRaw(): AppNotification[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : null;
  } catch {
    return null;
  }
}

function write(items: AppNotification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const notificationsStore = {
  getAll(): AppNotification[] {
    if (typeof window === "undefined") return [];
    const stored = readRaw();
    if (stored) return stored;
    // Semeia uma única vez; depois de limpar, não volta a semear.
    if (!localStorage.getItem(SEED_FLAG)) {
      const seeded = seed();
      write(seeded);
      localStorage.setItem(SEED_FLAG, "1");
      return seeded;
    }
    return [];
  },
  remove(ids: string[]): AppNotification[] {
    const set = new Set(ids);
    const next = (readRaw() ?? []).filter((n) => !set.has(n.id));
    write(next);
    return next;
  },
  clearAll(): void {
    write([]);
  },
};
