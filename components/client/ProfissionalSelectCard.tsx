"use client";

import { Check, Users } from "lucide-react";
import type { Employee } from "@/types/employee.types";

interface ProfissionalSelectCardProps {
  /** `null` → opção "Sem preferência". */
  employee: Employee | null;
  selected: boolean;
  onSelect: () => void;
}

export function ProfissionalSelectCard({
  employee,
  selected,
  onSelect,
}: ProfissionalSelectCardProps) {
  const isAny = employee === null;
  const displayName = isAny ? "Sem preferência" : employee.appName || employee.name;
  const subline = isAny
    ? "O sistema escolhe o próximo disponível"
    : employee.group || "Profissional";

  const initials = isAny
    ? "?"
    : (employee.appName || employee.name)
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group text-left rounded-lg border p-4 transition-all cursor-pointer flex items-center gap-3 ${
        selected
          ? "border-brand bg-brand/5"
          : "border-border-subtle bg-surface-raised hover:border-brand/40"
      }`}
    >
      <div
        className={`size-11 rounded-full grid place-items-center text-sm font-bold shrink-0 ${
          isAny ? "bg-surface-base text-muted-foreground" : "bg-brand/15 text-brand"
        }`}
      >
        {isAny ? <Users className="size-5" /> : initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{subline}</p>
      </div>
      {selected && <Check className="size-4 text-brand shrink-0" />}
    </button>
  );
}
