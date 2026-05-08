import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SummaryCardData {
  label: string;
  value: string;
  valueColor: string;
  icon: ReactNode;
  iconColor: string;
  bg: string;
}

interface SummaryRowProps {
  title: string;
  icon: ReactNode;
  iconColor: string;
  accentColor: string;
  cards: SummaryCardData[];
}

export function SummaryRow({
  title,
  icon,
  iconColor,
  accentColor,
  cards,
}: SummaryRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pl-1">
        <span className={iconColor}>{icon}</span>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {title}
        </h2>
        <div className={cn("flex-1 h-px border-t", accentColor)} />
      </div>
      <div
        className={cn(
          "grid gap-3",
          cards.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-2 lg:grid-cols-4",
        )}
      >
        {cards.map((card) => (
          <Card
            key={card.label}
            className={cn(card.bg, "border-border shadow-none")}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                  {card.label}
                </p>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
              <div
                className={cn(
                  "text-lg md:text-xl font-bold",
                  card.valueColor,
                )}
              >
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
