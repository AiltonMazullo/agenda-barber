"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function StatusBar({
  active,
  hidden,
  onChange,
}: {
  active: boolean;
  hidden: boolean;
  onChange: (patch: { active?: boolean; hidden?: boolean }) => void;
}) {
  const options: { value: boolean; label: string }[] = [
    { value: true, label: "Ativo" },
    { value: false, label: "Inativo" },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4 flex flex-wrap items-center gap-x-8 gap-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Status
        </span>
        <div className="flex rounded-md border border-border overflow-hidden">
          {options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange({ active: o.value })}
              className={cn(
                "px-4 h-8 text-xs font-semibold transition-colors",
                active === o.value
                  ? o.value
                    ? "bg-brand text-brand-foreground"
                    : "bg-danger text-white"
                  : "bg-surface-base text-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <Checkbox
          checked={hidden}
          onCheckedChange={(c) => onChange({ hidden: c === true })}
        />
        <span className="flex flex-col">
          <span className="text-sm text-foreground">Profissional oculto</span>
          <span className="text-[11px] text-muted-foreground">
            Não aparece na agenda online para agendamentos.
          </span>
        </span>
      </label>
    </div>
  );
}
