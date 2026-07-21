"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { STATUS_COR } from "./status";
import { minToTime, toDateInputValue } from "./helpers";
import type { AgendamentoVM } from "./types";

const MAX_VISIBLE_PER_DAY = 4;

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function AgendaMonthGrid({
  dates,
  agendamentos,
  currentMonth,
  onSelect,
  onDayClick,
}: {
  /** Grade de dias do mês, já preenchida até completar semanas inteiras. */
  dates: Date[];
  /** Agendamentos do mês (já filtrados por filial/profissional). */
  agendamentos: AgendamentoVM[];
  /** Mês "de referência" (dias fora dele aparecem esmaecidos). */
  currentMonth: number;
  onSelect?: (ag: AgendamentoVM) => void;
  onDayClick?: (date: Date) => void;
}) {
  const porDia = useMemo(() => {
    const map = new Map<string, AgendamentoVM[]>();
    for (const ag of agendamentos) {
      if (ag.status === "CANCELLED") continue;
      const list = map.get(ag.dataIso) ?? [];
      list.push(ag);
      map.set(ag.dataIso, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.inicioMin - b.inicioMin);
    return map;
  }, [agendamentos]);

  const hojeIso = toDateInputValue(new Date());

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b border-border-subtle shrink-0">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-text-faint"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr flex-1">
        {dates.map((d) => {
          const iso = toDateInputValue(d);
          const doMes = d.getMonth() === currentMonth;
          const hoje = iso === hojeIso;
          const doDia = porDia.get(iso) ?? [];
          const visiveis = doDia.slice(0, MAX_VISIBLE_PER_DAY);
          const excedente = doDia.length - visiveis.length;

          return (
            <div
              key={iso}
              className={cn(
                "min-h-[110px] border-b border-r border-border-subtle p-1.5 flex flex-col gap-1",
                !doMes && "bg-surface-base/40",
              )}
            >
              <button
                type="button"
                onClick={() => onDayClick?.(d)}
                className={cn(
                  "self-start size-6 rounded-full grid place-items-center text-xs font-semibold transition-colors shrink-0",
                  hoje
                    ? "bg-brand text-brand-foreground"
                    : doMes
                      ? "text-foreground hover:bg-surface-elevated"
                      : "text-text-faint hover:bg-surface-elevated",
                )}
              >
                {d.getDate()}
              </button>

              <div className="flex flex-col gap-1 min-w-0">
                {visiveis.map((ag) => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => onSelect?.(ag)}
                    className="truncate rounded px-1.5 py-0.5 text-[11px] font-medium text-left hover:brightness-125 transition-[filter]"
                    style={{
                      backgroundColor: `${STATUS_COR[ag.status]}26`,
                      color: STATUS_COR[ag.status],
                    }}
                    title={`${minToTime(ag.inicioMin)} · ${ag.cliente}`}
                  >
                    {minToTime(ag.inicioMin)} {ag.cliente}
                  </button>
                ))}
                {excedente > 0 && (
                  <button
                    type="button"
                    onClick={() => onDayClick?.(d)}
                    className="text-[11px] text-muted-foreground hover:text-foreground text-left px-1.5"
                  >
                    +{excedente} mais
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
