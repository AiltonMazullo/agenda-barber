/**
 * Conversão entre o shape do backend (cents, `categoryId`) e o shape usado
 * pela UI de "Regras de comissão" (reais, `category`) — ver
 * `types/employee.types.ts` (backend) e `types/professional-config.types.ts` (UI).
 */
import type {
  EmployeeDifferentiatedCommission,
  EmployeeProductCommissionRule,
  UpdateDifferentiatedCommissionPayload,
  UpdateProductCommissionRulePayload,
} from "@/types/employee.types";
import type {
  DifferentiatedCommission,
  ProductCommissionRule,
} from "@/types/professional-config.types";

export function productCommissionRuleFromBackend(
  rule: EmployeeProductCommissionRule | null,
): ProductCommissionRule {
  if (!rule) return { category: "", minSaleValue: 0, tiers: [] };
  return {
    category: rule.categoryId ?? "",
    minSaleValue: rule.minSaleValueInCents / 100,
    tiers: rule.tiers.map((t) => ({
      id: t.id,
      from: t.fromInCents / 100,
      to: t.toInCents === null ? null : t.toInCents / 100,
      percent: t.percent,
    })),
  };
}

export function productCommissionRuleToPayload(
  rule: ProductCommissionRule,
): UpdateProductCommissionRulePayload {
  return {
    categoryId: rule.category || null,
    minSaleValueInCents: Math.round(rule.minSaleValue * 100),
    tiers: rule.tiers.map((t) => ({
      fromInCents: Math.round(t.from * 100),
      toInCents: t.to === null ? null : Math.round(t.to * 100),
      percent: t.percent,
    })),
  };
}

export function differentiatedCommissionFromBackend(
  commission: EmployeeDifferentiatedCommission | null,
): DifferentiatedCommission {
  if (!commission) return { additionalPercent: 0, subscriberPercent: 0 };
  return {
    additionalPercent: commission.additionalPercent,
    subscriberPercent: commission.subscriberPercent,
  };
}

export function differentiatedCommissionToPayload(
  commission: DifferentiatedCommission,
): UpdateDifferentiatedCommissionPayload {
  return {
    additionalPercent: commission.additionalPercent,
    subscriberPercent: commission.subscriberPercent,
  };
}
