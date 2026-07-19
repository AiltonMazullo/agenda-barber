"use client";

import { SelectField } from "@/components/shared";
import type { AccessGroup } from "@/types/access-group.types";
import { SectionShell, FieldLabel } from "./Primitives";

export function AccessGroupSelect({
  accessGroupId,
  accessGroups,
  onChange,
}: {
  accessGroupId: string;
  accessGroups: AccessGroup[];
  onChange: (accessGroupId: string) => void;
}) {
  return (
    <SectionShell
      title="Grupo de acesso"
      description="Define quais permissões este profissional terá no sistema."
    >
      <div className="space-y-1.5">
        <FieldLabel required>Grupo de acesso</FieldLabel>
        <SelectField
          id="prof-access-group"
          value={accessGroupId}
          placeholder="Selecionar…"
          options={accessGroups.map((g) => ({ value: g.id, label: g.name }))}
          onChange={onChange}
        />
        {accessGroups.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            Nenhum grupo de acesso cadastrado. Crie um em Controle de Acesso.
          </p>
        )}
      </div>
    </SectionShell>
  );
}
