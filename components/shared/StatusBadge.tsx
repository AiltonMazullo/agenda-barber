import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types/common.types";

interface StatusBadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const TONE_STYLES: Record<Tone, string> = {
  neutral:
    "bg-surface-elevated text-muted-foreground border border-border",
  brand: "bg-brand/15 text-brand border border-brand/30",
  success:
    "bg-success/15 text-success-foreground border border-success/30",
  warning:
    "bg-warning/15 text-warning-foreground border border-warning/30",
  danger:
    "bg-danger/15 text-danger-foreground border border-danger/30",
  info: "bg-info/15 text-info-foreground border border-info/30",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        TONE_STYLES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
