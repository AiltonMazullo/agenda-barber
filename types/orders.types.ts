export type ComandaStatus = "ABERTA" | "FECHADA" | "CANCELADA";

export type ItemTipo = "PRODUTO" | "SERVICO";

export interface Agendamento {
  id: string;
  clienteNome: string;
  profissionalNome: string;
  servicoPrincipal: string;
  horario: string; // ISO
}

export interface CatalogoItem {
  id: string;
  nome: string;
  categoria: string;
  valor: number;
}

export interface ComandaItem {
  id: string;
  tipo: ItemTipo;
  catalogoId: string;
  nome: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
}

export interface Comanda {
  id: string;
  numero: number;
  agendamentoId: string;
  status: ComandaStatus;
  itens: ComandaItem[];
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComandaFormValues {
  agendamentoId: string;
  itens: ComandaItem[];
  observacoes?: string;
}