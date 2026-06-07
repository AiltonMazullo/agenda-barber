"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/shared";
import type { TimeOff } from "@/types/professional-config.types";
import { SectionShell, FieldLabel } from "./Primitives";
import { formatIsoDate, todayIso } from "./helpers";

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function isoFromDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function dateFromIso(iso: string) {
  return iso ? new Date(`${iso}T00:00:00`) : undefined;
}

function FolgaList({
  title,
  items,
  onRemove,
  muted,
}: {
  title: string;
  items: TimeOff[];
  onRemove: (id: string) => void;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{title}</FieldLabel>
      {items.length === 0 ? (
        <p className="text-xs text-text-faint py-1">Nenhuma folga.</p>
      ) : (
        items.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-md border border-border bg-surface-base px-3 h-9"
          >
            <span
              className={`text-xs flex-1 ${muted ? "text-muted-foreground" : "text-foreground"}`}
            >
              {formatIsoDate(t.start)} até {formatIsoDate(t.end)}
            </span>
            <button
              type="button"
              onClick={() => onRemove(t.id)}
              className="text-text-faint hover:text-danger-foreground transition-colors"
              aria-label="Remover folga"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export function Folgas({
  timeOff,
  onChange,
}: {
  timeOff: TimeOff[];
  onChange: (next: TimeOff[]) => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function add() {
    if (!start || !end) {
      toast.error("Informe as datas inicial e final.");
      return;
    }
    if (end < start) {
      toast.error("A data final deve ser igual ou posterior à inicial.");
      return;
    }
    onChange([...timeOff, { id: crypto.randomUUID(), start, end }]);
    setStart("");
    setEnd("");
  }

  function remove(id: string) {
    onChange(timeOff.filter((t) => t.id !== id));
  }

  const hoje = todayIso();
  const future = timeOff
    .filter((t) => t.end >= hoje)
    .sort((a, b) => a.start.localeCompare(b.start));
  const past = timeOff
    .filter((t) => t.end < hoje)
    .sort((a, b) => b.start.localeCompare(a.start));

  return (
    <SectionShell
      title="Folgas"
      description="Informe os períodos de folga do profissional. Você pode adicionar múltiplos períodos."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <FieldLabel>Adicionar folga</FieldLabel>
          <div className="flex items-end gap-2">
            <DatePickerField
              id="folga-ini"
              date={dateFromIso(start)}
              onChange={(d) => setStart(d ? isoFromDate(d) : "")}
              className="min-w-0"
            />
            <DatePickerField
              id="folga-fim"
              date={dateFromIso(end)}
              onChange={(d) => setEnd(d ? isoFromDate(d) : "")}
              className="min-w-0"
            />
          </div>
          <Button
            type="button"
            onClick={add}
            className="h-10 w-full bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-xs"
          >
            Adicionar
          </Button>
        </div>

        <FolgaList title="Próximas folgas" items={future} onRemove={remove} />
        <FolgaList
          title="Folgas passadas"
          items={past}
          onRemove={remove}
          muted
        />
      </div>
    </SectionShell>
  );
}
