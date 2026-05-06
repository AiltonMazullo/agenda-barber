import type { CategoriaFinanceira, Conta } from "@/types/financial.types";

export const CONTAS_PAGAR_MOCK: Conta[] = [
  {
    id: "cp_1",
    tipo: "pagar",
    descricao: "Aluguel março",
    categoria: "Aluguel",
    vencimento: "2026-03-29",
    forma: "boleto",
    valor: 3500,
    status: "pendente",
  },
  {
    id: "cp_2",
    tipo: "pagar",
    descricao: "Fornecedor produtos",
    categoria: "Fornecedores",
    vencimento: "2026-03-24",
    forma: "pix",
    valor: 1200,
    status: "pendente",
  },
  {
    id: "cp_3",
    tipo: "pagar",
    descricao: "Energia elétrica",
    categoria: "Despesas fixas",
    vencimento: "2026-03-19",
    forma: "debito_auto",
    valor: 450,
    status: "pago",
  },
  {
    id: "cp_4",
    tipo: "pagar",
    descricao: "Comissão Carlos",
    categoria: "Comissões",
    vencimento: "2026-03-14",
    forma: "pix",
    valor: 2080,
    status: "pago",
  },
];

export const CONTAS_RECEBER_MOCK: Conta[] = [
  {
    id: "cr_1",
    tipo: "receber",
    descricao: "Pacote mensal Ana Lima",
    categoria: "Assinaturas",
    vencimento: "2026-04-10",
    forma: "pix",
    valor: 199.9,
    status: "pendente",
  },
  {
    id: "cr_2",
    tipo: "receber",
    descricao: "Serviço avulso João",
    categoria: "Serviços",
    vencimento: "2026-04-05",
    forma: "cartao_credito",
    valor: 199.9,
    status: "pago",
  },
];

export const CATEGORIAS_FINANCEIRAS_MOCK: CategoriaFinanceira[] = [
  { id: "cat_1", nome: "Aluguel", tipo: "pagar" },
  { id: "cat_2", nome: "Fornecedores", tipo: "pagar" },
  { id: "cat_3", nome: "Despesas fixas", tipo: "pagar" },
  { id: "cat_4", nome: "Comissões", tipo: "pagar" },
  { id: "cat_5", nome: "Assinaturas", tipo: "receber" },
  { id: "cat_6", nome: "Serviços", tipo: "receber" },
];
