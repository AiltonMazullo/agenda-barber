export type ProdutoStatus = "ok" | "baixo" | "critico";

export type MovimentacaoTipo = "entrada" | "saida";

export interface Produto {
  id: string;
  nome: string;
  qtdAtual: number;
  qtdMinima: number;
  precoCusto: number;
  precoVenda: number;
}

export interface Movimentacao {
  id: string;
  produtoId: string;
  produtoNome: string;
  tipo: MovimentacaoTipo;
  quantidade: number;
  valorUnit?: number;
  observacao?: string;
  criadoEm: string;
}

export interface VendaProduto {
  id: string;
  produtoId: string;
  produtoNome: string;
  clienteNome: string;
  clienteTelefone: string;
  profissionalNome: string;
  data: string;
  valor: number;
}
