import { Sparkles } from "lucide-react";

/**
 * "Bandeira" de destaque — pílula em gradiente azul fincada sobre a borda
 * superior do card (o card precisa ser `relative`).
 */
export function FeaturedFlag({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute -top-2.5 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-blue-500/30 ring-1 ring-white/20">
      <Sparkles className="size-2.5" />
      {label}
    </span>
  );
}
