import type {
  Movimentacao,
  Produto,
  VendaProduto,
} from "@/types/inventory.types";

export const PRODUTOS_MOCK: Produto[] = [
  {
    id: "prod_1",
    nome: "Pomada Modeladora",
    qtdAtual: 12,
    qtdMinima: 5,
    precoCusto: 30,
    precoVenda: 50,
  },
  {
    id: "prod_2",
    nome: "Shampoo Antiqueda",
    qtdAtual: 3,
    qtdMinima: 5,
    precoCusto: 40,
    precoVenda: 70,
  },
  {
    id: "prod_3",
    nome: "Óleo de Barba",
    qtdAtual: 1,
    qtdMinima: 4,
    precoCusto: 45,
    precoVenda: 90,
  },
  {
    id: "prod_4",
    nome: "Cera Matte",
    qtdAtual: 8,
    qtdMinima: 3,
    precoCusto: 35,
    precoVenda: 60,
  },
];

export const MOVIMENTACOES_MOCK: Movimentacao[] = [
  {
    id: "mov_1",
    produtoId: "prod_1",
    produtoNome: "Pomada Modeladora",
    tipo: "entrada",
    quantidade: 10,
    valorUnit: 30,
    observacao: "Reposição mensal",
    criadoEm: "2026-04-08",
  },
  {
    id: "mov_2",
    produtoId: "prod_2",
    produtoNome: "Shampoo Antiqueda",
    tipo: "saida",
    quantidade: 2,
    valorUnit: 40,
    observacao: "Uso interno",
    criadoEm: "2026-04-07",
  },
  {
    id: "mov_3",
    produtoId: "prod_3",
    produtoNome: "Óleo de Barba",
    tipo: "saida",
    quantidade: 3,
    valorUnit: 45,
    observacao: "Venda balcão",
    criadoEm: "2026-04-06",
  },
];

export const VENDAS_PRODUTO_MOCK: VendaProduto[] = [
  {
    id: "vp_1",
    produtoId: "prod_1",
    produtoNome: "Pomada Modeladora",
    clienteNome: "João Silva",
    clienteTelefone: "(81) 99999-0001",
    profissionalNome: "Carlos",
    data: "2026-04-08",
    valor: 50,
  },
  {
    id: "vp_2",
    produtoId: "prod_3",
    produtoNome: "Óleo de Barba",
    clienteNome: "Pedro Lima",
    clienteTelefone: "(81) 99999-0002",
    profissionalNome: "Marcus",
    data: "2026-04-06",
    valor: 90,
  },
];
