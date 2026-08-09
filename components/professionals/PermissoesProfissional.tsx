"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { PROFISSIONAL_PERMISSION_GROUPS, resolveGroupKeys } from "@/utils/professional-permissions";
import { SectionShell } from "./Primitives";
import type { PermissionCatalogModule } from "@/types/access-group.types";

/**
 * Checklist de permissões do profissional (ver print "CASH" /
 * spec-revisao-cliente-1.md §7.3) — substitui o seletor genérico de Grupo de
 * acesso quando o profissional é do tipo "com agenda" (`ProfessionalForm`).
 * Cada grupo do print liga/desliga um ou mais itens do catálogo real de
 * permissões de uma vez (ver `PROFISSIONAL_PERMISSION_GROUPS`).
 */
export function PermissoesProfissional({
  catalog,
  catalogLoading,
  selectedKeys,
  onChange,
}: {
  catalog: PermissionCatalogModule[];
  catalogLoading: boolean;
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}) {
  const selected = new Set(selectedKeys);

  function toggle(keys: string[], checked: boolean) {
    const next = new Set(selected);
    for (const key of keys) {
      if (checked) next.add(key);
      else next.delete(key);
    }
    onChange(Array.from(next));
  }

  return (
    <SectionShell
      title="Permissões"
      description="Escolha as permissões do Profissional."
    >
      {catalogLoading ? (
        <p className="text-xs text-muted-foreground py-2">
          Carregando permissões…
        </p>
      ) : (
        <div className="space-y-3">
          {PROFISSIONAL_PERMISSION_GROUPS.map((group) => {
            const keys = resolveGroupKeys(catalog, group.items);
            const checked = keys.length > 0 && keys.every((k) => selected.has(k));
            return (
              <label
                key={group.label}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => toggle(keys, c === true)}
                />
                <span className="text-sm text-foreground">{group.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
