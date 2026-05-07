export type ClientStatus = "ativo" | "inativo" | "bloqueado";

export type ClientSubscriptionStatus =
  | "ativo"
  | "inadimplente"
  | "cancelado"
  | "nenhum";

export type ClientOrigem =
  | "manual"
  | "online"
  | "instagram"
  | "indicacao"
  | "whatsapp"
  | "google";

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  origem: ClientOrigem;
  profissionalPreferido: string;
  status: ClientStatus;
  foto: string | null;

  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;

  // Extras
  notas: string;
  senha: string;
  criadoEm: string;
  atualizadoEm: string;

  // Assinatura (KAN-99)
  subscriptionStatus: ClientSubscriptionStatus;
  subscriptionPlanoNome?: string;

  // Bloqueio (KAN-101)
  motivoBloqueio?: string;
  bloqueadoEm?: string;

  // Recompra programada (KAN-102)
  recompraEm?: string;
  recompraServico?: string;
}
