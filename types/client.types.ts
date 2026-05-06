export type ClientStatus = "ativo" | "inativo" | "bloqueado";

export type ClientSubscriptionStatus =
  | "ativo"
  | "inadimplente"
  | "cancelado"
  | "nenhum";

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  status: ClientStatus;
  subscriptionPlanoNome?: string;
  subscriptionStatus: ClientSubscriptionStatus;
  observacao?: string;
  criadoEm: string;
}
