/**
 * Data sugerida para o fim de uma assinatura cancelada de forma agendada:
 * 1 dia antes da próxima cobrança (não o próprio dia) — evita cancelar
 * depois que a renovação já rodou, caso o job de pré-cancelamento e o de
 * cobrança caiam no mesmo dia. Mesma regra usada pelo backend
 * (`computeScheduledCancelDate`, `subscriptions.service.ts`) — ver
 * spec-ajustes-escopo-2 §1.2 e spec-ajustes-escopo-4 §7.
 */
export function computeScheduledCancelDate(billingDay: number | null): Date {
  if (!billingDay) return new Date();
  const today = new Date();
  const nextBilling = new Date(today.getFullYear(), today.getMonth(), billingDay);
  if (nextBilling <= today) nextBilling.setMonth(nextBilling.getMonth() + 1);
  nextBilling.setDate(nextBilling.getDate() - 1);
  return nextBilling;
}
