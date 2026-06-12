"use client";

import { Check, Shuffle } from "lucide-react";
import { FeaturedFlag } from "./FeaturedFlag";
import { apiAssetUrl } from "@/lib/api";
import type { Employee } from "@/types/employee.types";

interface ProfissionalSelectCardProps {
  /** `null` → opção "Sem preferência" (sistema sorteia um profissional). */
  employee: Employee | null;
  selected: boolean;
  onSelect: () => void;
  /** Foto resolvida externamente (ex.: fallback local); prioridade sobre o avatarUrl. */
  photoUrl?: string | null;
}

export function ProfissionalSelectCard({
  employee,
  selected,
  onSelect,
  photoUrl,
}: ProfissionalSelectCardProps) {
  const isAny = employee === null;
  const displayName = isAny
    ? "Sem preferência"
    : employee.appName || employee.name;
  const subline = isAny
    ? "O sistema escolhe um profissional"
    : "Profissional";

  const initials = isAny
    ? ""
    : (employee.appName || employee.name)
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();

  const fotoUrl = isAny
    ? null
    : (photoUrl ?? apiAssetUrl(employee.avatarUrl));

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative text-left rounded-lg border p-4 transition-all cursor-pointer flex items-center gap-3 ${
        selected
          ? "border-brand bg-brand/5"
          : "border-border-subtle bg-surface-raised hover:border-brand/40"
      }`}
    >
      {!isAny && employee.featured && <FeaturedFlag label="Destaque" />}
      <div
        className={`size-11 rounded-full grid place-items-center text-sm font-bold shrink-0 bg-cover bg-center overflow-hidden ${
          isAny ? "bg-surface-base text-muted-foreground" : "bg-brand/15 text-brand"
        }`}
        style={fotoUrl ? { backgroundImage: `url(${fotoUrl})` } : undefined}
      >
        {isAny ? <Shuffle className="size-5" /> : !fotoUrl && initials}
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
