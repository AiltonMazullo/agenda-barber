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
 * Fora dos dias marcados em `Plan.availableWeekdays`, o benefício de
 * gratuidade via cota (`usage[].free`) não se aplica — mas o serviço
 * continua "do plano": cai direto pro desconto configurado no próprio
 * `PlanService`, nunca preço cheio (mesma regra do backend em
 * `subscriptions.service.ts#getServicePricing`, ponto real de cobrança ao
 * fechar a comanda). Lista vazia = plano vale todos os dias. Sem
 * `referenceDate` (ainda não escolhida no fluxo de agendamento) também não
 * restringe — mesmo comportamento do backend sem esse parâmetro.
 */
function isOutsideAllowedWeekdays(availableWeekdays: number[], referenceDate?: Date): boolean {
  if (availableWeekdays.length === 0 || !referenceDate) return false;
  return !availableWeekdays.includes(referenceDate.getDay());
}

/**
 * Calcula o preço de um serviço sob as regras da assinatura ativa do cliente.
 * - Sem assinatura ativa, ou serviço fora do plano → preço cheio.
 * - Dentro dos dias permitidos do plano (`referenceDate`) e com cota mensal
 *   ainda disponível (`usage[].free`) → grátis (R$ 0,00).
 * - Fora dos dias permitidos, OU cota esgotada, OU plano sem cota → desconto
 *   (`PlanService.discountPercent`, 100% = incluso/grátis mesmo assim).
 */
export function priceServiceUnderSubscription(
  service: Service,
  subscription: ActiveSubscription,
  usage: ServiceUsage[] = [],
  referenceDate?: Date,
): ServicePricing {
  const originalCents = service.priceInCents;

  const planService = subscription?.plan.planServices.find((ps) => ps.serviceId === service.id);

  if (!planService) {
    // Sem desconto por serviço específico — checa se o serviço pertence a
    // uma categoria com desconto no plano (mesma regra de
    // `subscriptions.service.ts#getServicePricing`, ponto real de cobrança
    // ao fechar a comanda). Desconto por categoria não tem cota mensal
    // (sempre aplicado, sem conceito de grátis/monthlyLimit) nem é
    // restrito por `availableWeekdays` — essa restrição só vale para o
    // benefício de "serviço incluso" (`PlanService`) abaixo.
    const categoryDiscount = service.categoryId
      ? subscription?.plan.planCategories.find((pc) => pc.categoryId === service.categoryId)
      : undefined;
    if (categoryDiscount) {
      const effectiveCents = Math.round(originalCents * (1 - categoryDiscount.discountPercent / 100));
      return {
        originalCents,
        effectiveCents,
        status: categoryDiscount.discountPercent >= 100 ? "included" : "discount",
        discountPct: categoryDiscount.discountPercent,
      };
    }

    // Fora do plano (ou sem assinatura ativa) — ainda assim respeita uma
    // promoção ativa do serviço (ver ajustes/Gestão.md §Promoções), já que
    // ela não depende de assinatura.
    const effectiveCents = service.effectivePriceInCents ?? originalCents;
    return { originalCents, effectiveCents, status: "full", discountPct: 0 };
  }

  const outsideAllowedWeekdays = isOutsideAllowedWeekdays(
    subscription?.plan.availableWeekdays ?? [],
    referenceDate,
  );
  if (!outsideAllowedWeekdays) {
    const serviceUsage = usage.find((u) => u.serviceId === service.id);
    if (serviceUsage?.free) {
      return { originalCents, effectiveCents: 0, status: "included", discountPct: 100 };
    }
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

/**
 * Rótulo de desconto exibido no card de plano do cliente.
 * - `discountPercent === 100` → "Incluso".
 * - `monthlyLimit` definido e `discountPercent > 0` → "N% OFF para usar mais vezes
 *   (M grátis/mês)" — M é a quantidade grátis/mês configurada no plano; o desconto só
 *   se aplica ao uso que exceder essa cota (ver `DialogNovoPlano`: "Qtd. grátis no mês
 *   e desconto (%) aplicado a partir do uso que exceder essa quantidade").
 * - Caso contrário → "N% off".
 */
export function formatDiscountLabel(
  discountPercent: number,
  monthlyLimit?: number | null,
): string {
  if (discountPercent >= 100) return "Incluso";
  if (monthlyLimit != null && discountPercent > 0) {
    return `${discountPercent}% OFF para usar mais vezes (${monthlyLimit} grátis/mês)`;
  }
  return `${discountPercent}% off`;
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
