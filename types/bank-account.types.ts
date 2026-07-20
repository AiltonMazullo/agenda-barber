export type BankAccountType = "CORRENTE" | "POUPANCA" | "OUTRO";
export type BankAccountStatus = "ACTIVE" | "INACTIVE";

export interface BankAccount {
  id: string;
  name: string;
  holderName: string;
  holderDocument: string;
  accountType: BankAccountType;
  bankCode: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  status: BankAccountStatus;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountPayload {
  name: string;
  holderName: string;
  holderDocument: string;
  accountType: BankAccountType;
  bankCode: string;
  bankName: string;
  agency: string;
  accountNumber: string;
}

export type UpdateBankAccountPayload = Partial<CreateBankAccountPayload> & {
  status?: BankAccountStatus;
};
