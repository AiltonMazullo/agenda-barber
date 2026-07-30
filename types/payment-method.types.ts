export type PaymentMethodTiming = "AVISTA" | "APRAZO";
export type PaymentMethodStatus = "ACTIVE" | "INACTIVE";

export interface PaymentMethodBranchConfig {
  id: string;
  paymentMethodId: string;
  branchId: string;
  bankAccountId: string | null;
  feePercent: number;
  receiptDeadlineDays: number;
  autoMarkAsReceived: boolean;
  branch: { id: string; name: string };
  bankAccount: { id: string; name: string } | null;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  timing: PaymentMethodTiming;
  status: PaymentMethodStatus;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  branchConfigs: PaymentMethodBranchConfig[];
}

export interface CreatePaymentMethodPayload {
  name: string;
  timing: PaymentMethodTiming;
}

export interface UpdatePaymentMethodPayload {
  name?: string;
  timing?: PaymentMethodTiming;
  status?: PaymentMethodStatus;
}

export interface BranchConfigInput {
  branchId: string;
  bankAccountId?: string | null;
  feePercent: number;
  receiptDeadlineDays: number;
  autoMarkAsReceived: boolean;
}
