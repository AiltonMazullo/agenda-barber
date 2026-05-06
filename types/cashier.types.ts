export type CaixaStatus = "fechado" | "aberto";

export type CaixaMovimentacaoTipo = "entrada" | "saida";

export interface CaixaMovimentacao {
  id: string;
  caixaId: string;
  tipo: CaixaMovimentacaoTipo;
  descricao: string;
  valor: number;
  hora: string;
  comandaId?: string;
  responsavelId?: string;
}

export interface Caixa {
  id: string;
  filialId: string;
  filialNome: string;
  status: CaixaStatus;
  abertura: string;
  fechamento?: string;
  valorInicial: number;
  valorContado?: number;
  observacaoAbertura?: string;
  observacaoFechamento?: string;
  movimentacoes: CaixaMovimentacao[];
  responsavelAberturaId: string;
  responsavelFechamentoId?: string;
}
