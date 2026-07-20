export type PreApprovalStatus = "AGUARDANDO" | "ERRO" | "SUCESSO";

export interface PreApprovedClient {
  id: string;
  clientId: string;
  planId: string;
  startDate: string;
  cardLast4: string | null;
  soldByEmployeeId: string | null;
  status: PreApprovalStatus;
  errorMessage: string | null;
  linkSentAt: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; email: string; phone: string | null };
  plan: { id: string; name: string; priceInCents: number };
  soldBy: { id: string; name: string } | null;
}

export interface CreatePreApprovedClientPayload {
  clientId: string;
  planId: string;
  startDate: string;
  cardToken?: string;
  cardLast4?: string;
  soldByEmployeeId?: string;
}
