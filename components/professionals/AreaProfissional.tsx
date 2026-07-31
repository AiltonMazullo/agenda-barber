"use client";

import { Info } from "lucide-react";
import { SelectField } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { maskBRLInput, parseBRL } from "@/utils/format";
import { SectionShell, FieldLabel } from "./Primitives";
import { PERIOD_OPTIONS } from "./helpers";

export function AreaProfissional({
  attendancePeriodDays,
  onChange,
  defaultBonusInCents,
  defaultValeInCents,
  onChangeDefaultBonus,
  onChangeDefaultVale,
}: {
  attendancePeriodDays: number | null;
  onChange: (days: number | null) => void;
  defaultBonusInCents?: number | null;
  defaultValeInCents?: number | null;
  onChangeDefaultBonus?: (cents: number | null) => void;
  onChangeDefaultVale?: (cents: number | null) => void;
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

        {onChangeDefaultBonus && onChangeDefaultVale && (
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
            <div className="space-y-1.5 flex-1">
              <FieldLabel>Bônus padrão</FieldLabel>
              <p className="text-[11px] text-muted-foreground">
                Pré-preenche o campo "Bônus" ao gerar comissões — continua editável.
              </p>
              <Input
                value={
                  defaultBonusInCents ? (defaultBonusInCents / 100).toFixed(2).replace(".", ",") : ""
                }
                onChange={(e) => {
                  const masked = maskBRLInput(e.target.value);
                  onChangeDefaultBonus(masked ? Math.round(parseBRL(masked) * 100) : null);
                }}
                placeholder="R$ 0,00"
                className="bg-surface-base border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <FieldLabel>Vale padrão</FieldLabel>
              <p className="text-[11px] text-muted-foreground">
                Pré-preenche o campo "Vale" ao gerar comissões — continua editável.
              </p>
              <Input
                value={
                  defaultValeInCents ? (defaultValeInCents / 100).toFixed(2).replace(".", ",") : ""
                }
                onChange={(e) => {
                  const masked = maskBRLInput(e.target.value);
                  onChangeDefaultVale(masked ? Math.round(parseBRL(masked) * 100) : null);
                }}
                placeholder="R$ 0,00"
                className="bg-surface-base border-border text-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}
