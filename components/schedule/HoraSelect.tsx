"use client";

import { useMemo } from "react";
import { Clock, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DropdownButton } from "./Primitives";
import { minToTime, timeToMin, isSameDay } from "./helpers";
import { START_HOUR, END_HOUR } from "./types";

/** Próximo slot (>= now) válido para "hoje"; senão devolve o fallback. */
export function defaultHoraParaData(
  date: Date | undefined,
  fallback: string,
  intervalMin = 10,
): string {
  if (!date || !isSameDay(date, new Date())) return fallback;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (timeToMin(fallback) > nowMin) return fallback;
  let next = Math.ceil((nowMin + 1) / intervalMin) * intervalMin;
  if (next < START_HOUR * 60) next = START_HOUR * 60;
  if (next > END_HOUR * 60) next = END_HOUR * 60;
  return minToTime(next);
}

export function HoraSelect({
  value,
  onChange,
  date,
  intervalMin = 10,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Data selecionada — usada para desabilitar horários já passados (hoje). */
  date: Date | undefined;
  intervalMin?: number;
}) {
  const slots = useMemo(() => {
    const out: string[] = [];
    for (let min = START_HOUR * 60; min <= END_HOUR * 60; min += intervalMin) {
      out.push(minToTime(min));
    }
    return out;
  }, [intervalMin]);

  const hoje = date ? isSameDay(date, new Date()) : false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <DropdownButton className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center justify-between gap-2 hover:border-brand/40 transition-colors cursor-pointer">
          <span className="flex items-center gap-2">
            <Clock className="size-3.5 text-muted-foreground" />
            {value || "Selecione"}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </DropdownButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-surface-raised border-border text-foreground max-h-60 overflow-y-auto">
        {slots.map((s) => {
          const passou = hoje && timeToMin(s) <= nowMin;
          return (
            <DropdownMenuItem
              key={s}
              disabled={passou}
              onClick={() => {
                if (!passou) onChange(s);
              }}
              className={cn(
                "text-xs cursor-pointer hover:bg-surface-elevated",
                value === s && "bg-brand/10 text-brand font-bold",
                passou && "opacity-40 cursor-not-allowed",
              )}
            >
              {s}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
