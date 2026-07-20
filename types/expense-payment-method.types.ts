export type ExpensePaymentMethodStatus = "ACTIVE" | "INACTIVE";

export interface ExpensePaymentMethod {
  id: string;
  name: string;
  autoMarkAsPaid: boolean;
  bankAccountId: string | null;
  status: ExpensePaymentMethodStatus;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  bankAccount: { id: string; name: string } | null;
}

export interface CreateExpensePaymentMethodPayload {
  name: string;
  autoMarkAsPaid: boolean;
  bankAccountId?: string;
}

export interface UpdateExpensePaymentMethodPayload {
  name?: string;
  autoMarkAsPaid?: boolean;
  bankAccountId?: string | null;
  status?: ExpensePaymentMethodStatus;
}
