import type { Service } from "@/types/service.types";
import type { ClientPlan } from "@/types/client-plan.types";

export type ServicePriceStatus = "included" | "discount" | "full";

export interface ServicePricing {
  originalCents: number;
  effectiveCents: number;
  status: ServicePriceStatus;
  /** Percentual de desconto aplicado (apenas em `discount`). */
  discountPct: number;
}

/**
 * Calcula o preço de um serviço sob as regras do plano do cliente.
 * - Sem plano ativo → preço cheio.
 * - Serviço coberto pelo plano → R$ 0,00 (incluso).
 * - Fora do plano → desconto configurado no plano.
 */
export function priceServiceUnderPlan(
  service: Service,
  plan: ClientPlan | null | undefined,
): ServicePricing {
  const originalCents = service.priceInCents;

  if (!plan || !plan.active) {
    return {
      originalCents,
      effectiveCents: originalCents,
      status: "full",
      discountPct: 0,
    };
  }

  if (plan.includedServiceIds.includes(service.id)) {
    return { originalCents, effectiveCents: 0, status: "included", discountPct: 0 };
  }

  const pct = plan.rules.outsideDiscountPct;
  const effectiveCents = Math.round(originalCents * (1 - pct / 100));
  return { originalCents, effectiveCents, status: "discount", discountPct: pct };
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Formata dias da semana: `[1,2,3,4,5]` → "Seg, Ter, Qua, Qui e Sex". */
export function formatWeekdays(days: number[]): string {
  const labels = days
    .filter((d) => d >= 0 && d <= 6)
    .map((d) => WEEKDAY_LABELS[d]);
  if (labels.length === 0) return "—";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}
