export type PreCancelledStatus = "AGUARDANDO" | "ERRO" | "SUCESSO";

export const CANCEL_REASON_OPTIONS = [
  { value: "DISPONIBILIDADE_HORARIO", label: "Disponibilidade de horário" },
  { value: "FINANCEIRO", label: "Financeiro" },
  { value: "FREQUENCIA", label: "Frequência" },
  { value: "INSATISFACAO_ATENDIMENTO", label: "Insatisfação com o atendimento" },
  { value: "MUDANCA_BAIRRO", label: "Mudança de bairro" },
  { value: "MUDANCA_CIDADE", label: "Mudança de cidade" },
  { value: "NAO_QUIS_INFORMAR", label: "Não quis informar" },
  { value: "REAJUSTE", label: "Reajuste" },
  { value: "SAIDA_PROFISSIONAL", label: "Saída de profissional" },
  { value: "UPGRADE_DOWNGRADE", label: "Upgrade / Downgrade" },
  { value: "CASHBACK", label: "Cashback" },
  { value: "RETENTATIVAS_EXCEDIDAS", label: "Retentativas de cobrança excedidas" },
] as const;

export type CancelReasonCode = (typeof CANCEL_REASON_OPTIONS)[number]["value"];

export interface PreCancelledClient {
  id: string;
  subscriptionId: string;
  cancelDate: string;
  reason: CancelReasonCode;
  status: PreCancelledStatus;
  errorMessage: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  subscription: {
    id: string;
    client: { id: string; name: string; email: string; phone: string | null };
    plan: { id: string; name: string };
  };
}

export interface CreatePreCancelledClientPayload {
  subscriptionId: string;
  cancelDate: string;
  reason: CancelReasonCode;
}
