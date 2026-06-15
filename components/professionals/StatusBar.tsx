"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function StatusBar({
  active,
  hidden,
  onChange,
  onHiddenChange,
  featured,
  onFeaturedChange,
}: {
  active: boolean;
  hidden: boolean;
  onChange: (patch: { active?: boolean; hidden?: boolean }) => void;
  /** Quando fornecido, o toggle "Oculto" chama este callback (campo do backend). */
  onHiddenChange?: (value: boolean) => void;
  /** Destaque (campo do backend). Só aparece quando há `onFeaturedChange`. */
  featured?: boolean;
  onFeaturedChange?: (value: boolean) => void;
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
          onCheckedChange={(c) =>
            onHiddenChange
              ? onHiddenChange(c === true)
              : onChange({ hidden: c === true })
          }
          className="cursor-pointer"
        />
        <span className="flex flex-col">
          <span className="text-sm text-foreground">Profissional oculto</span>
          <span className="text-[11px] text-muted-foreground">
            Não aparece na agenda online para agendamentos.
          </span>
        </span>
      </label>

      {onFeaturedChange && (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={featured}
            onCheckedChange={(c) => onFeaturedChange(c === true)}
            className="cursor-pointer"
          />
          <span className="flex flex-col">
            <span className="text-sm text-foreground">Destaque</span>
            <span className="text-[11px] text-muted-foreground">
              Aparece primeiro e com selo para o cliente.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
