"use client";

import { Clock, Flame } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Service } from "@/types/service.types";
import type { ServicePricing } from "@/utils/plan-pricing";

interface ServicoSelectCardProps {
  service: Service;
  selected: boolean;
  onSelect: () => void;
  /** Preço sob as regras do plano (assinante). Ausente → preço cheio. */
  pricing?: ServicePricing;
}

function formatBRLFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Card de serviço com seleção por checkbox. É um `div` clicável (não `button`)
 * porque o Checkbox do shadcn já é um `button` — aninhar quebraria a hidratação.
 * Serviços em alta (`featured`) recebem o ícone de fogo antes do nome. Quando há
 * `pricing` de plano, mostra o preço original riscado + o valor efetivo e a tag
 * de cobertura (incluso / desconto).
 */
export function ServicoSelectCard({
  service,
  selected,
  onSelect,
  pricing,
}: ServicoSelectCardProps) {
  const hasPlanPrice = pricing && pricing.status !== "full";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group text-left rounded-lg border p-4 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
        selected
          ? "border-brand bg-brand/5"
          : "border-border-subtle bg-surface-raised hover:border-brand/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} className="pointer-events-none mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-base font-bold text-foreground min-w-0 mt-0.5">
              {service.featured && (
                <Flame className="size-4 text-orange-500 shrink-0" />
              )}
              <span className="truncate">{service.name}</span>
            </h3>

            <div className="text-right whitespace-nowrap shrink-0">
              {hasPlanPrice ? (
                <>
                  <p className="text-xs text-muted-foreground line-through">
                    {formatBRLFromCents(pricing.originalCents)}
                  </p>
                  <p className="text-base font-bold text-brand">
                    {formatBRLFromCents(pricing.effectiveCents)}
                  </p>
                  {pricing.status === "discount" && (
                    <p className="text-[10px] text-muted-foreground">
                      {pricing.discountPct}% de desconto
                    </p>
                  )}
                </>
              ) : (
                <span className="text-base font-bold text-brand">
                  {formatBRLFromCents(service.priceInCents)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{service.durationMin} minutos</span>
          </div>

          {pricing?.status === "included" && (
            <span className="mt-2 inline-flex items-center rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-500">
              Incluso no seu plano
            </span>
          )}
          {pricing?.status === "discount" && (
            <span className="mt-2 inline-flex items-center rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              Fora do plano · Desconto aplicado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
