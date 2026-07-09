import type { Service } from "@/types/service.types";
import type { MySubscription } from "@/types/subscription.types";

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
 * - Serviço coberto pelo plano (`PlanService.discountPercent`) → desconto real
 *   aplicado (100% = incluso/grátis).
 * - Fora do plano → preço cheio (o plano real não define desconto genérico
 *   para serviços que não estão nele).
 */
export function priceServiceUnderSubscription(
  service: Service,
  subscription: ActiveSubscription,
): ServicePricing {
  const originalCents = service.priceInCents;

  const planService = subscription?.plan.planServices.find(
    (ps) => ps.serviceId === service.id,
  );

  if (!planService) {
    return { originalCents, effectiveCents: originalCents, status: "full", discountPct: 0 };
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
