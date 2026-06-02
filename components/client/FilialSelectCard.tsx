"use client";

import { Check, Building2, MapPin } from "lucide-react";
import type { Branch } from "@/types/branch.types";

interface FilialSelectCardProps {
  branch: Branch;
  selected: boolean;
  onSelect: () => void;
}

export function FilialSelectCard({
  branch,
  selected,
  onSelect,
}: FilialSelectCardProps) {
  const endereco = [branch.street, branch.number, branch.neighborhood]
    .filter((p) => p && p.trim())
    .join(", ");
  const cidadeUf = [branch.city, branch.uf]
    .filter((p) => p && p.trim())
    .join(" / ");

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
      <div className="size-11 rounded-full grid place-items-center shrink-0 bg-brand/15 text-brand">
        <Building2 className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">
          {branch.name}
        </p>
        {(endereco || cidadeUf) && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            {[endereco, cidadeUf].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      {selected && <Check className="size-4 text-brand shrink-0" />}
    </button>
  );
}
