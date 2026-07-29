import type { Service } from "@/types/service.types";
import type { MySubscription, ServiceUsage } from "@/types/subscription.types";

export type ServicePriceStatus = "included" | "discount" | "full";

export interface ServicePricing {
  originalCents: number;
  effectiveCents: number;
  status: ServicePriceStatus;
  /** Percentual de desconto aplicado (apenas em `discount`/`included`). */
  discountPct: number;
}

type ActiveSubscription = MySubscription["subscription"] | null | undefined;

/**
 * Calcula o preço de um serviço sob as regras da assinatura ativa do cliente.
 * - Sem assinatura ativa → preço cheio.
 * - Serviço coberto pelo plano com cota mensal (`monthlyLimit`) ainda
 *   disponível (`usage[].free`) → grátis (R$ 0,00).
 * - Cota esgotada ou plano sem cota → desconto (`PlanService.discountPercent`,
 *   100% = incluso/grátis mesmo sem cota).
 * - Fora do plano → preço cheio (o plano real não define desconto genérico
 *   para serviços que não estão nele).
 */
export function priceServiceUnderSubscription(
  service: Service,
  subscription: ActiveSubscription,
  usage: ServiceUsage[] = [],
): ServicePricing {
  const originalCents = service.priceInCents;

  const planService = subscription?.plan.planServices.find(
    (ps) => ps.serviceId === service.id,
  );

  if (!planService) {
    // Fora do plano (ou sem assinatura ativa) — ainda assim respeita uma
    // promoção ativa do serviço (ver ajustes/Gestão.md §Promoções), já que
    // ela não depende de assinatura.
    const effectiveCents = service.effectivePriceInCents ?? originalCents;
    return { originalCents, effectiveCents, status: "full", discountPct: 0 };
  }

  const serviceUsage = usage.find((u) => u.serviceId === service.id);
  if (serviceUsage?.free) {
    return { originalCents, effectiveCents: 0, status: "included", discountPct: 100 };
  }

  const pct = planService.discountPercent;
  const effectiveCents = Math.round(originalCents * (1 - pct / 100));
  return {
    originalCents,
    effectiveCents,
    status: pct >= 100 ? "included" : "discount",
    discountPct: pct,
  };
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
