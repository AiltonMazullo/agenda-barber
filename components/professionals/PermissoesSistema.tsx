"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { ProfessionalPermissions } from "@/types/professional-config.types";
import { SectionShell } from "./Primitives";
import { PERMISSION_ITEMS } from "./helpers";

export function PermissoesSistema({
  permissions,
  onChange,
}: {
  permissions: ProfessionalPermissions;
  onChange: (patch: Partial<ProfessionalPermissions>) => void;
}) {
  return (
    <SectionShell title="Permissões do sistema">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {PERMISSION_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <Checkbox
              checked={permissions[item.key]}
              onCheckedChange={(c) =>
                onChange({
                  [item.key]: c === true,
                } as Partial<ProfessionalPermissions>)
              }
            />
            <span className="text-sm text-foreground">{item.label}</span>
          </label>
        ))}
      </div>
    </SectionShell>
  );
}
