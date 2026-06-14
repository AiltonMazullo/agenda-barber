/**
 * Plano/assinatura do cliente. **Mock local** enquanto o backend não expõe
 * planos — segue o mesmo padrão dos outros `*-config-store`. Permite simular o
 * fluxo de agendamento do cliente assinante (preços inclusos, regras, upgrade).
 */

export interface ClientPlanRules {
  /** Dias da semana cobertos (0 = Domingo … 6 = Sábado). */
  includedWeekdays: number[];
  /** Limite total de usos por mês. */
  usesTotal: number;
  /** Usos ainda disponíveis no período. */
  usesRemaining: number;
  /** Antecedência máxima para agendar (dias). */
  bookingWindowDays: number;
  /** Desconto aplicado a serviços fora do plano (%). */
  outsideDiscountPct: number;
  /** Texto exibido para o comportamento ao ultrapassar o limite. */
  overLimitText: string;
}

export interface ClientPlan {
  /** Assinatura ativa e em dia. */
  active: boolean;
  /** Nome do plano (ex.: "Clube Smart Mensal"). */
  name: string;
  /** Serviços cobertos pelo plano (exibidos como R$ 0,00). */
  includedServiceIds: string[];
  rules: ClientPlanRules;
}

export function defaultClientPlan(): ClientPlan {
  return {
    active: false,
    name: "Clube Smart Mensal",
    includedServiceIds: [],
    rules: {
      includedWeekdays: [1, 2, 3, 4, 5],
      usesTotal: 4,
      usesRemaining: 4,
      bookingWindowDays: 30,
      outsideDiscountPct: 50,
      overLimitText: "Cobraremos avulso",
    },
  };
}
