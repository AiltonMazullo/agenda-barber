import { Sparkles, Star } from "lucide-react";

interface FeaturedFlagProps {
  label: string;
  /**
   * `"corner"` (padrão): pílula em gradiente fincada sobre a borda superior do
   * card (o card precisa ser `relative`).
   * `"inline"`: selo contornado (estrela) alinhado no fluxo do card.
   */
  variant?: "corner" | "inline";
}

/** "Bandeira" de destaque. Ver `variant` para os dois formatos. */
export function FeaturedFlag({ label, variant = "corner" }: FeaturedFlagProps) {
  if (variant === "inline") {
    return (
      <span className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-brand/50 bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand">
        <Star className="size-3" />
        {label}
      </span>
    );
  }

  return (
    <span className="pointer-events-none absolute -top-2.5 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-blue-500/30 ring-1 ring-white/20">
      <Sparkles className="size-2.5" />
      {label}
    </span>
  );
}
