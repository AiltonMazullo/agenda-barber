"use client";

interface HoraGridProps {
  /** Lista de horários disponíveis no formato "HH:mm". */
  slots: string[];
  /** Conjunto de horários ocupados (mesmo formato). */
  busy: Set<string>;
  selected: string | null;
  onSelect: (slot: string) => void;
}

export function HoraGrid({ slots, busy, selected, onSelect }: HoraGridProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-raised p-8 text-center text-sm text-muted-foreground">
        Nenhum horário disponível neste dia.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {slots.map((slot) => {
        const isBusy = busy.has(slot);
        const isSelected = selected === slot;
        return (
          <button
            key={slot}
            type="button"
            onClick={() => !isBusy && onSelect(slot)}
            disabled={isBusy}
            className={`h-10 rounded-md text-sm font-medium transition-all ${
              isBusy
                ? "bg-surface-raised text-text-faint cursor-not-allowed line-through opacity-60"
                : isSelected
                  ? "bg-brand text-brand-foreground cursor-pointer"
                  : "bg-surface-raised text-foreground border border-border-subtle hover:border-brand cursor-pointer"
            }`}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}
