"use client";

import {
  Crown,
  CalendarDays,
  RotateCcw,
  Hash,
  CalendarClock,
  Percent,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatWeekdays } from "@/utils/plan-pricing";
import type { ClientPlan } from "@/types/client-plan.types";

interface PlanoRegrasCardProps {
  plan: ClientPlan;
}

/** Painel com as principais regras do plano contratado pelo cliente. */
export function PlanoRegrasCard({ plan }: PlanoRegrasCardProps) {
  const { rules } = plan;
  const lines: Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
    accent?: boolean;
  }> = [
    {
      icon: <CalendarDays className="size-3.5" />,
      label: "Dias de uso incluídos",
      value: formatWeekdays(rules.includedWeekdays),
    },
    {
      icon: <RotateCcw className="size-3.5" />,
      label: "Usos restantes",
      value: `${rules.usesRemaining} de ${rules.usesTotal}`,
      accent: true,
    },
    {
      icon: <Hash className="size-3.5" />,
      label: "Limite total de usos/mês",
      value: `${rules.usesTotal} usos`,
    },
    {
      icon: <CalendarClock className="size-3.5" />,
      label: "Janela para agendar",
      value: `Até ${rules.bookingWindowDays} dias de antecedência`,
    },
    {
      icon: <Percent className="size-3.5" />,
      label: "Desconto fora dos dias incluídos",
      value: `${rules.outsideDiscountPct}% de desconto`,
    },
    {
      icon: <AlertTriangle className="size-3.5" />,
      label: "Ao ultrapassar o limite",
      value: rules.overLimitText,
    },
  ];

  return (
    <Card className="bg-surface-raised border border-border-subtle ring-0">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-brand" />
          <h3 className="text-sm font-bold text-foreground">Seu plano e regras</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-500">
            Plano ativo
          </span>
          <span className="text-sm font-semibold text-foreground truncate">
            {plan.name}
          </span>
        </div>

        <ul className="space-y-2.5">
          {lines.map((l) => (
            <li
              key={l.label}
              className="flex items-start justify-between gap-3 text-xs"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {l.icon}
                {l.label}
              </span>
              <span
                className={`text-right font-semibold ${
                  l.accent ? "text-green-500" : "text-foreground"
                }`}
              >
                {l.value}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
