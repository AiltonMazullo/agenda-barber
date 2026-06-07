"use client";

import { Info } from "lucide-react";
import { SelectField } from "@/components/shared";
import { SectionShell, FieldLabel } from "./Primitives";
import { PERIOD_OPTIONS } from "./helpers";

export function AreaProfissional({
  attendancePeriodDays,
  onChange,
}: {
  attendancePeriodDays: number | null;
  onChange: (days: number | null) => void;
}) {
  return (
    <SectionShell title="Configurações do profissional">
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-info-bg border border-info/30 px-3 py-2.5 text-xs text-info-foreground">
          <Info className="size-3.5 shrink-0 mt-0.5" />
          <span>
            As configurações abaixo são exclusivas para o tipo de profissional.
          </span>
        </div>

        <div className="space-y-1.5 max-w-sm">
          <FieldLabel required>Periodicidade de atendimento (dias)</FieldLabel>
          <p className="text-[11px] text-muted-foreground">
            Defina a recorrência média de atendimento deste profissional.
          </p>
          <SelectField
            id="prof-periodicidade"
            value={attendancePeriodDays ? String(attendancePeriodDays) : ""}
            placeholder="Selecionar…"
            options={PERIOD_OPTIONS}
            onChange={(v) => onChange(v ? Number(v) : null)}
            className="min-w-0"
          />
        </div>
      </div>
    </SectionShell>
  );
}
