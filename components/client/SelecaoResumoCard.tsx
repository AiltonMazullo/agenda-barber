"use client";

import { ShoppingBag, Clock, CircleDollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { priceServiceUnderSubscription } from "@/utils/plan-pricing";
import type { Service } from "@/types/service.types";
import type { MySubscription, ServiceUsage } from "@/types/subscription.types";

interface SelecaoResumoCardProps {
  /** Serviços selecionados, na ordem de seleção. */
  services: Service[];
  /** Remove um serviço da seleção (desmarcar no resumo). */
  onRemove?: (id: string) => void;
  /** Assinatura ativa → preços recalculados pelas regras do plano. */
  subscription?: MySubscription["subscription"] | null;
  /** Uso mensal por serviço (cota grátis restante) da assinatura ativa. */
  usage?: ServiceUsage[];
}

function formatBRLFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Resumo da seleção de serviços — soma de tempo e valor em tempo real. */
export function SelecaoResumoCard({
  services,
  onRemove,
  subscription,
  usage = [],
}: SelecaoResumoCardProps) {
  const totalMin = services.reduce((acc, s) => acc + s.durationMin, 0);
  const totalCents = services.reduce(
    (acc, s) => acc + priceServiceUnderSubscription(s, subscription, usage).effectiveCents,
    0,
  );
  const planActive = !!subscription;

  return (
    <Card className="bg-surface-raised border border-border-subtle ring-0">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-brand" />
          <h3 className="text-sm font-bold text-foreground">
            Resumo da seleção
          </h3>
        </div>

        {services.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Selecione serviços ao lado para ver o resumo.
          </p>
        ) : (
          <div className="space-y-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2.5 rounded-md border border-border-subtle bg-surface-base px-3 py-2"
              >
                <Checkbox
                  checked
                  onCheckedChange={() => onRemove?.(s.id)}
                  aria-label={`Remover ${s.name}`}
                  className="cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {s.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.durationMin} min
                  </p>
                </div>
                <span className="text-sm font-bold text-brand whitespace-nowrap">
                  {formatBRLFromCents(
                    priceServiceUnderSubscription(s, subscription, usage).effectiveCents,
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        <Separator className="bg-border-subtle" />

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-4" /> Tempo total
          </span>
          <span className="font-bold text-foreground">{totalMin} minutos</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CircleDollarSign className="size-4" /> Total estimado
          </span>
          <span className={`font-bold ${planActive ? "text-green-500" : "text-brand"}`}>
            {formatBRLFromCents(totalCents)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
