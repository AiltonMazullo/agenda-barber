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
  rules: EmployeeProductCommissionRule[] | null,
): ProductCommissionRule {
  if (!rules) return [];
  return rules.map((r) => ({
    id: r.id,
    category: r.categoryId ?? "",
    minSaleValue: r.minSaleValueInCents / 100,
    percent: r.percent,
  }));
}

export function productCommissionRuleToPayload(
  rules: ProductCommissionRule,
): UpdateProductCommissionRulePayload {
  return {
    rules: rules.map((r) => ({
      categoryId: r.category || null,
      minSaleValueInCents: Math.round(r.minSaleValue * 100),
      percent: r.percent,
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
