/**
 * Tipos espelhando `PaymentGatewayConfig` do backend (spec-gateways-pagamento.md).
 * Cada barbearia pode ter um registro por provider; só um fica `isDefault=true`.
 */

export type GatewayProvider = "GALAXPAY" | "CELCOIN" | "ASAAS";

export type GatewayConfigStatus = "ACTIVE" | "INACTIVE";

export interface GalaxPayCredentials {
  galaxPayId: string;
  galaxPayHash: string;
  galaxPaySecurityToken: string;
  galaxPayPublicToken: string;
}

export interface CelcoinCredentials {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "production";
}

export interface AsaasCredentials {
  apiKey: string;
  environment: "sandbox" | "production";
}

export type ProviderCredentials =
  | GalaxPayCredentials
  | CelcoinCredentials
  | AsaasCredentials;

export interface PaymentGatewayConfig {
  id: string;
  provider: GatewayProvider;
  /** Sempre mascarado pelo backend (ex.: "****ab12") — nunca o valor real. */
  credentials: Record<string, string>;
  externalAccountId: string | null;
  webhookToken: string | null;
  status: GatewayConfigStatus;
  isDefault: boolean;
  lastTestedAt: string | null;
  lastTestResult: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePaymentGatewayPayload =
  | { provider: "GALAXPAY"; credentials: GalaxPayCredentials; externalAccountId?: string; webhookToken?: string }
  | { provider: "CELCOIN"; credentials: CelcoinCredentials; externalAccountId?: string; webhookToken?: string }
  | { provider: "ASAAS"; credentials: AsaasCredentials; externalAccountId?: string; webhookToken?: string };

export interface UpdatePaymentGatewayPayload {
  credentials?: Partial<GalaxPayCredentials & CelcoinCredentials & AsaasCredentials>;
  externalAccountId?: string;
  webhookToken?: string;
  status?: GatewayConfigStatus;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}
