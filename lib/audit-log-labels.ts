/**
 * Dicionários de tradução para os registros de auditoria (`AuditLog`).
 * Mantidos centralizados para reaproveitar em outras telas que venham a exibir auditoria.
 */

export const ACTION_LABEL: Record<string, string> = {
  CREATE: "Criação",
  UPDATE: "Atualização",
  CANCEL: "Cancelamento",
  RESCHEDULE: "Reagendamento",
  TRANSFER: "Transferência",
  RESIZE: "Redimensionamento",
  DELETE: "Exclusão",
  CONFIRM: "Confirmação",
  COMPLETE: "Conclusão",
};

export const FIELD_LABEL: Record<string, string> = {
  status: "Status",
  scheduledAt: "Data/Hora agendada",
  durationMin: "Duração (min)",
  clientId: "Cliente",
  employeeId: "Profissional",
  branchId: "Filial",
  services: "Serviços",
  "startAt/endAt": "Início/Fim do bloqueio",
  nextInvoiceValueInCents: "Valor da próxima fatura",
  "priceOverrideInCents/billingDay": "Valor/Dia de cobrança",
};

export const VALUE_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
  NO_SHOW: "Não compareceu",
};

export function translateAction(action: string): string {
  return ACTION_LABEL[action] ?? action;
}

export function translateField(field: string): string {
  return FIELD_LABEL[field] ?? field;
}

export function translateValue(value: string | null): string {
  if (value === null || value === "") return "—";
  return VALUE_LABEL[value] ?? value;
}
