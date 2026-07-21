/**
 * Tipos espelhando `PaymentGatewayConfig` do backend (spec-gateways-pagamento.md).
 * Cada barbearia pode ter um registro por provider; só um fica `isDefault=true`.
 */

export type GatewayProvider = "CELCOIN" | "ASAAS";

export type GatewayConfigStatus = "ACTIVE" | "INACTIVE";

export interface CelcoinCredentials {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "production";
}

export interface AsaasCredentials {
  apiKey: string;
  environment: "sandbox" | "production";
}

export type ProviderCredentials = CelcoinCredentials | AsaasCredentials;

export interface PaymentGatewayConfig {
  id: string;
  provider: GatewayProvider;
  /** Sempre mascarado pelo backend (ex.: "****ab12") — nunca o valor real. */
  credentials: Record<string, string>;
  externalAccountId: string | null;
  webhookToken: string | null;
  /** Montada pelo backend a partir de API_BASE_URL — cadastrar no painel do gateway. */
  webhookUrl: string;
  status: GatewayConfigStatus;
  isDefault: boolean;
  lastTestedAt: string | null;
  lastTestResult: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePaymentGatewayPayload =
  | { provider: "CELCOIN"; credentials: CelcoinCredentials; externalAccountId?: string; webhookToken?: string }
  | { provider: "ASAAS"; credentials: AsaasCredentials; externalAccountId?: string; webhookToken?: string };

export interface UpdatePaymentGatewayPayload {
  credentials?: Partial<CelcoinCredentials & AsaasCredentials>;
  externalAccountId?: string;
  webhookToken?: string;
  status?: GatewayConfigStatus;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}
