"use client";

import { useEffect, useState } from "react";
import { Crown, CreditCard, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { servicesService } from "@/services/services.service";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useClientPlan } from "@/hooks/useClientPlan";
import type { Service } from "@/types/service.types";

export default function PlanoClientePage() {
  const { barbershop } = usePublicBarbershop();
  const { plan, update } = useClientPlan(barbershop?.id);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!barbershop) return;
    let active = true;
    servicesService
      .list(barbershop.id)
      .then((list) => {
        if (active) setServices(list);
      })
      .catch(() => {
        /* silencioso — serviços são complemento da simulação */
      });
    return () => {
      active = false;
    };
  }, [barbershop]);

  function toggleActive(value: boolean) {
    // Ao ativar pela primeira vez, inclui todos os serviços por padrão (o dono
    // desmarca os que ficam de fora do plano).
    if (value && plan.includedServiceIds.length === 0 && services.length > 0) {
      update({ active: true, includedServiceIds: services.map((s) => s.id) });
    } else {
      update({ active: value });
    }
  }

  function toggleIncluded(id: string) {
    const next = plan.includedServiceIds.includes(id)
      ? plan.includedServiceIds.filter((x) => x !== id)
      : [...plan.includedServiceIds, id];
    update({ includedServiceIds: next });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assine para ter serviços inclusos, descontos e prioridade no
          agendamento.
        </p>
      </div>

      <Card className="bg-surface-raised border border-border-subtle ring-0">
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-brand/15 grid place-items-center shrink-0">
              <Crown className="size-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">{plan.name}</p>
              <p className="text-xs text-muted-foreground">
                Demonstração local — passa a integrar com o backend quando as
                rotas de planos existirem.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <Checkbox
              checked={plan.active}
              onCheckedChange={(c) => toggleActive(c === true)}
              className="cursor-pointer"
            />
            <span className="text-sm font-medium text-foreground">
              Simular assinatura ativa
            </span>
          </label>

          {plan.active && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Serviços inclusos no plano
              </p>

              {services.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Carregando serviços…
                </p>
              ) : (
                <div className="space-y-1.5">
                  {services.map((s) => {
                    const included = plan.includedServiceIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2.5 cursor-pointer rounded-md border border-border-subtle bg-surface-base px-3 py-2"
                      >
                        <Checkbox
                          checked={included}
                          onCheckedChange={() => toggleIncluded(s.id)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-foreground flex-1 min-w-0 truncate">
                          {s.name}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            included ? "text-green-500" : "text-blue-400"
                          }`}
                        >
                          {included
                            ? "Incluso (R$ 0,00)"
                            : `${plan.rules.outsideDiscountPct}% off`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="flex items-start gap-2 rounded-md bg-surface-base border border-border-subtle px-3 py-2">
                <Info className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Serviços inclusos aparecem como R$ 0,00 no agendamento; os
                  demais recebem {plan.rules.outsideDiscountPct}% de desconto.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!plan.active && (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-8 text-center space-y-2">
          <CreditCard className="size-7 text-text-faint mx-auto" />
          <p className="text-sm text-muted-foreground">
            Ative a simulação acima para ver o fluxo de agendamento como
            assinante.
          </p>
        </div>
      )}
    </div>
  );
}
