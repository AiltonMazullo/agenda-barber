export type ContaTipo = "pagar" | "receber";

export type ContaStatus = "pendente" | "pago" | "atrasado";

export type FormaPagamento =
  | "pix"
  | "boleto"
  | "cartao_credito"
  | "cartao_debito"
  | "dinheiro"
  | "debito_auto";

export interface Conta {
  id: string;
  tipo: ContaTipo;
  descricao: string;
  categoria: string;
  vencimento: string;
  forma: FormaPagamento;
  valor: number;
  status: ContaStatus;
  observacao?: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: ContaTipo;
}

export interface ResumoContas {
  vencidos: number;
  aVencer: number;
  pagos: number;
  total: number;
}

export interface ResumoFinanceiro {
  contasPagar: ResumoContas;
  contasReceber: {
    naoRecebidos: number;
    aReceber: number;
    recebidos: number;
    total: number;
  };
  balanco: {
    atual: number;
    projetado: number;
  };
}
