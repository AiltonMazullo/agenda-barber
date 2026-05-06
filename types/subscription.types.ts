export type ContratoStatus =
  | "ativo"
  | "inadimplente"
  | "cancelado"
  | "pre_aprovado"
  | "pre_cancelado";

export type CobrancaOrigem = "gateway" | "manual";

export type PlanoCiclo = "mensal" | "trimestral" | "semestral" | "anual";

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  ciclo: PlanoCiclo;
  beneficios: string[];
  ativo: boolean;
}

export interface Contrato {
  id: string;
  clienteId: string;
  clienteNome: string;
  planoId: string;
  planoNome: string;
  origem: CobrancaOrigem;
  inicio: string;
  valor: number;
  status: ContratoStatus;
}
