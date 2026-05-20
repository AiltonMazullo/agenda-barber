/**
 * Tipos espelhando o modelo `PaymentData` (credenciais GalaxPay) do backend.
 * Cada barbearia tem no máximo um conjunto de credenciais.
 */

export interface PaymentData {
  id: string;
  galaxPayId: string;
  galaxPayHash: string;
  galaxPaySecurityToken: string;
  galaxPayPublicToken: string;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDataPayload {
  galaxPayId: string;
  galaxPayHash: string;
  galaxPaySecurityToken: string;
  galaxPayPublicToken: string;
}

export interface UpdatePaymentDataPayload {
  galaxPayId?: string;
  galaxPayHash?: string;
  galaxPaySecurityToken?: string;
  galaxPayPublicToken?: string;
}
