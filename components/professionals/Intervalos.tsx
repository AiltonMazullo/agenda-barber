"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/shared";
import type { ProfessionalInterval } from "@/types/professional-config.types";
import { SectionShell } from "./Primitives";
import { WEEKDAYS, DAY_LABEL, TIME_OPTIONS } from "./helpers";

export function Intervalos({
  intervals,
  onChange,
}: {
  intervals: ProfessionalInterval[];
  onChange: (next: ProfessionalInterval[]) => void;
}) {
  const [day, setDay] = useState("");
  const [start, setStart] = useState("12:00");
  const [end, setEnd] = useState("13:00");

  const dayOptions = WEEKDAYS.map((d) => ({
    value: String(d.value),
    label: d.label,
  }));

  function add() {
    if (!day) return;
    onChange([
      ...intervals,
      { id: crypto.randomUUID(), day: Number(day), start, end },
    ]);
    setDay("");
  }

  function patch(id: string, p: Partial<ProfessionalInterval>) {
    onChange(intervals.map((it) => (it.id === id ? { ...it, ...p } : it)));
  }

  function remove(id: string) {
    onChange(intervals.filter((it) => it.id !== id));
  }

  const ordered = [...intervals].sort(
    (a, b) => a.day - b.day || a.start.localeCompare(b.start),
  );

  return (
    <SectionShell
      title="Intervalos (almoço e outros)"
      description="Defina os intervalos do profissional. Podem ser excluídos diretamente na agenda para encaixes ou arrastados para trabalhos."
    >
      <div className="space-y-2">
        {ordered.map((it) => (
          <div
            key={it.id}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
          >
            <span className="text-sm text-foreground truncate">
              {DAY_LABEL[it.day]}
            </span>
            <SelectField
              id={`int-ini-${it.id}`}
              value={it.start}
              options={TIME_OPTIONS}
              onChange={(v) => patch(it.id, { start: v })}
              className="flex-none w-24 min-w-0"
            />
            <SelectField
              id={`int-fim-${it.id}`}
              value={it.end}
              options={TIME_OPTIONS}
              onChange={(v) => patch(it.id, { end: v })}
              className="flex-none w-24 min-w-0"
            />
            <button
              type="button"
              onClick={() => remove(it.id)}
              className="size-8 rounded-md border border-border bg-surface-base text-text-faint hover:text-danger-foreground hover:border-danger/40 transition-colors grid place-items-center"
              aria-label="Remover intervalo"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}

        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center pt-1">
          <SelectField
            id="int-add-dia"
            value={day}
            placeholder="Selecionar dia"
            options={dayOptions}
            onChange={setDay}
            className="min-w-0"
          />
          <SelectField
            id="int-add-ini"
            value={start}
            options={TIME_OPTIONS}
            onChange={setStart}
            className="flex-none w-24 min-w-0"
          />
          <SelectField
            id="int-add-fim"
            value={end}
            options={TIME_OPTIONS}
            onChange={setEnd}
            className="flex-none w-24 min-w-0"
          />
          <Button
            type="button"
            onClick={add}
            disabled={!day}
            className="h-10 bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-xs disabled:opacity-50"
          >
            Adicionar
          </Button>
        </div>
      </div>
    </SectionShell>
  );
}
