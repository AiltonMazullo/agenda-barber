"use client";

import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectField } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { WorkingHour } from "@/types/professional-config.types";
import { SectionShell } from "./Primitives";
import { WEEKDAYS, TIME_OPTIONS } from "./helpers";

export function HorariosAtendimento({
  workingHours,
  onChange,
}: {
  workingHours: WorkingHour[];
  onChange: (next: WorkingHour[]) => void;
}) {
  function setDay(day: number, patch: Partial<WorkingHour>) {
    onChange(workingHours.map((w) => (w.day === day ? { ...w, ...patch } : w)));
  }

  return (
    <SectionShell
      title="Horários de atendimento"
      description="Defina os horários por dia. Dias/horários não selecionados não aparecem na coluna do profissional na agenda."
    >
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-text-faint">
          <span>Dia da semana</span>
          <span className="w-24">Início</span>
          <span className="w-24">Fim</span>
          <span className="w-8" />
        </div>
        {WEEKDAYS.map(({ value, label }) => {
          const wh = workingHours.find((w) => w.day === value);
          if (!wh) return null;
          return (
            <div
              key={value}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
            >
              <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                <Checkbox
                  checked={wh.enabled}
                  onCheckedChange={(c) => setDay(value, { enabled: c === true })}
                />
                <span
                  className={cn(
                    "text-sm truncate",
                    wh.enabled ? "text-foreground" : "text-text-faint",
                  )}
                >
                  {label}
                </span>
              </label>
              <SelectField
                id={`h-ini-${value}`}
                value={wh.start}
                options={TIME_OPTIONS}
                onChange={(v) => setDay(value, { start: v })}
                className="flex-none w-24 min-w-0"
              />
              <SelectField
                id={`h-fim-${value}`}
                value={wh.end}
                options={TIME_OPTIONS}
                onChange={(v) => setDay(value, { end: v })}
                className="flex-none w-24 min-w-0"
              />
              <button
                type="button"
                onClick={() => setDay(value, { enabled: false })}
                className="size-8 rounded-md border border-border bg-surface-base text-text-faint hover:text-danger-foreground hover:border-danger/40 transition-colors grid place-items-center"
                aria-label={`Desativar ${label}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
