import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types/common.types";

interface SummaryCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
  /** Quando true, aplica cor de fundo soft do tom (ex: card de "vencidos" em vermelho). */
  emphasized?: boolean;
}

const VALUE_TONES: Record<Tone, string> = {
  neutral: "text-foreground",
  brand: "text-brand",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  danger: "text-danger-foreground",
  info: "text-info-foreground",
};

const ICON_TONES: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  brand: "text-brand",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  danger: "text-danger-foreground",
  info: "text-info-foreground",
};

const EMPHASIZED_BG: Record<Tone, string> = {
  neutral: "bg-surface-raised",
  brand: "bg-warning-bg",
  success: "bg-success-bg",
  warning: "bg-warning-bg",
  danger: "bg-danger-bg",
  info: "bg-info-bg",
};

export function SummaryCard({
  label,
  value,
  icon,
  tone = "neutral",
  className,
  emphasized = false,
}: SummaryCardProps) {
  const bg = emphasized ? EMPHASIZED_BG[tone] : "bg-surface-raised";

  return (
    <Card className={cn(bg, "border-border shadow-none", className)}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
            {label}
          </p>
          {icon && <span className={ICON_TONES[tone]}>{icon}</span>}
        </div>
        <div className={cn("text-xl md:text-2xl font-bold", VALUE_TONES[tone])}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
