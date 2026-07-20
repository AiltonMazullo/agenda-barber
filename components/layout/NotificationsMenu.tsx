"use client";

import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}

/**
 * Sino de notificações. Quando vazio mostra o estado "sem notificações";
 * com itens, permite selecionar (checkbox) e limpar selecionadas, ou limpar
 * todas de uma vez. Ao abrir, marca as notificações como lidas.
 */
export function NotificationsMenu() {
  const { barbershop } = useAuth();
  const { items, markAllRead, clearAll, clearMany } = useNotifications(barbershop?.id);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const hasUnread = items.some((n) => !n.isRead);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleClearAll() {
    const count = items.length;
    clearAll();
    setSelected(new Set());
    toast.success(
      count === 1
        ? "Notificação limpa."
        : `Todas as ${count} notificações foram limpas.`,
    );
  }

  function handleClearSelected() {
    const count = selected.size;
    clearMany([...selected]);
    setSelected(new Set());
    toast.success(
      count === 1
        ? "1 notificação removida."
        : `${count} notificações removidas.`,
    );
  }

  const hasItems = items.length > 0;

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) markAllRead();
      }}
    >
      <PopoverTrigger
        aria-label="Notificações"
        className="cursor-pointer relative inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted"
      >
        <Bell className="size-4" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand" />
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 gap-0 p-0 bg-surface-raised border border-border ring-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2.5">
          <p className="text-sm font-bold text-foreground">Notificações</p>
          {hasItems && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-danger-foreground transition-colors cursor-pointer"
            >
              Limpar todas
            </button>
          )}
        </div>

        {!hasItems ? (
          <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
            <Bell className="size-6 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">
              Você não tem notificações
            </p>
            <p className="text-[11px] text-muted-foreground">
              Quando houver novidades, elas aparecem aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-72 overflow-y-auto">
              {items.map((n) => {
                const isSel = selected.has(n.id);
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(n.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(n.id);
                      }
                    }}
                    className={`flex items-start gap-2.5 border-b border-border-subtle/60 px-3 py-2.5 cursor-pointer transition-colors last:border-0 ${
                      isSel ? "bg-brand/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={isSel}
                      className="pointer-events-none mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground truncate">
                          {!n.isRead && (
                            <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                          )}
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selected.size > 0 && (
              <div className="border-t border-border-subtle p-2">
                <button
                  type="button"
                  onClick={handleClearSelected}
                  className="w-full h-8 rounded-md bg-danger/10 text-danger-foreground hover:bg-danger/20 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  Limpar selecionadas ({selected.size})
                </button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
