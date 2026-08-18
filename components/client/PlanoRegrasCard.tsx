"use client";

import { Crown, Lock, Repeat2, Layers, CalendarOff, Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatWeekdays } from "@/utils/plan-pricing";
import { formatBRL } from "@/utils/format";
import type { Plan } from "@/types/plan.types";
import type { ServiceUsage } from "@/types/subscription.types";

interface PlanoRegrasCardProps {
  plan: Plan;
  usage: ServiceUsage[];
}

/** Painel com as principais regras e o uso mensal da assinatura do cliente. */
export function PlanoRegrasCard({ plan, usage }: PlanoRegrasCardProps) {
  const metrics: Array<{ icon: React.ReactNode; label: string; value: string }> = [
    {
      icon: <Repeat2 className="size-3.5" />,
      label: "Uso a cada",
      value: plan.serviceFrequencyDays > 0 ? `${plan.serviceFrequencyDays} dias` : "Sem restrição",
    },
    {
      icon: <Lock className="size-3.5" />,
      label: "Fidelidade",
      value: plan.subscriptionLockDays > 0 ? `${plan.subscriptionLockDays} dias` : "Sem fidelidade",
    },
    {
      icon: <Layers className="size-3.5" />,
      label: "Serviços por vez",
      value: String(plan.maxSimultaneousServices),
    },
  ];

  // "Dias de gratuidade" (freeDays) é config interna do backoffice — não
  // aparece no app do cliente (spec-revisao-cliente-4.md §5.4). O card mostra
  // em vez disso os dias em que o plano vale ("Permitido para" — availableWeekdays,
  // renomeado de "Dias livres", §5.5).
  metrics.push({
    icon: <CalendarOff className="size-3.5" />,
    label: "Permitido para",
    value:
      plan.availableWeekdays.length > 0 ? formatWeekdays(plan.availableWeekdays) : "Todos os dias",
  });

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
          <span className="text-sm font-semibold text-foreground truncate">{plan.name}</span>
        </div>

        <ul className="space-y-2.5">
          {metrics.map((l) => (
            <li key={l.label} className="flex items-start justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {l.icon}
                {l.label}
              </span>
              <span className="text-right font-semibold text-foreground">{l.value}</span>
            </li>
          ))}
        </ul>

        {usage.length > 0 && (
          <div className="pt-2 border-t border-border-subtle space-y-2">
            <div className="flex items-center gap-1.5">
              <Scissors className="size-3 text-muted-foreground" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Uso este mês
              </p>
            </div>
            <ul className="space-y-1.5">
              {usage.map((u) => {
                const service = plan.planServices.find((ps) => ps.serviceId === u.serviceId)
                  ?.service;
                return (
                  <li
                    key={u.serviceId}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-muted-foreground truncate">
                      {service?.name ?? "Serviço"}
                    </span>
                    <span
                      className={`font-semibold whitespace-nowrap ${
                        u.free ? "text-green-500" : "text-danger-foreground"
                      }`}
                    >
                      {u.remaining} de {u.monthlyLimit} restantes
                      {!u.free && ` · próximo com desconto: ${formatBRL(u.priceInCents / 100)}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
