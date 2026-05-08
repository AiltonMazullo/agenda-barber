/** Mock data para os relatórios prioritários (KAN-108, 119, 120, 132, 133, 134). */

export interface FaturamentoMensal {
  mes: string; // "2026-01"
  mesLabel: string; // "Jan/26"
  servicos: number;
  produtos: number;
  assinaturas: number;
  total: number;
}

export interface TicketMedioProfissional {
  profissionalId: string;
  profissionalNome: string;
  atendimentos: number;
  faturamento: number;
  ticketMedio: number;
  clientesDistintos: number;
}

export interface TicketMedioCliente {
  clienteId: string;
  clienteNome: string;
  visitas: number;
  totalGasto: number;
  ticketMedio: number;
  ultimaVisita: string;
}

export interface ComissaoServico {
  profissionalId: string;
  profissionalNome: string;
  servicosCount: number;
  faturamentoBruto: number;
  taxa: number;
  valorComissao: number;
}

export interface ComissaoProduto {
  profissionalId: string;
  profissionalNome: string;
  produtosCount: number;
  faturamentoBruto: number;
  taxa: number;
  valorComissao: number;
}

// ─── Faturamento (KAN-108) ────────────────────────────────────────────────────

export const FATURAMENTO_MENSAL_MOCK: FaturamentoMensal[] = [
  {
    mes: "2025-11",
    mesLabel: "Nov/25",
    servicos: 12450,
    produtos: 1830,
    assinaturas: 4200,
    total: 18480,
  },
  {
    mes: "2025-12",
    mesLabel: "Dez/25",
    servicos: 18900,
    produtos: 2740,
    assinaturas: 4500,
    total: 26140,
  },
  {
    mes: "2026-01",
    mesLabel: "Jan/26",
    servicos: 14200,
    produtos: 1950,
    assinaturas: 4800,
    total: 20950,
  },
  {
    mes: "2026-02",
    mesLabel: "Fev/26",
    servicos: 13800,
    produtos: 2120,
    assinaturas: 5100,
    total: 21020,
  },
  {
    mes: "2026-03",
    mesLabel: "Mar/26",
    servicos: 16500,
    produtos: 2480,
    assinaturas: 5400,
    total: 24380,
  },
  {
    mes: "2026-04",
    mesLabel: "Abr/26",
    servicos: 17200,
    produtos: 2670,
    assinaturas: 5650,
    total: 25520,
  },
];

// ─── Ticket Médio (KAN-132 prof, KAN-133 cliente, KAN-134 atendimento geral) ──

export const TICKET_PROFISSIONAL_MOCK: TicketMedioProfissional[] = [
  {
    profissionalId: "carlos",
    profissionalNome: "Carlos Barbeiro",
    atendimentos: 142,
    faturamento: 9230,
    ticketMedio: 65,
    clientesDistintos: 98,
  },
  {
    profissionalId: "marcos",
    profissionalNome: "Marcos Silva",
    atendimentos: 118,
    faturamento: 6962,
    ticketMedio: 59,
    clientesDistintos: 87,
  },
  {
    profissionalId: "rafael",
    profissionalNome: "Rafael Costa",
    atendimentos: 95,
    faturamento: 6175,
    ticketMedio: 65,
    clientesDistintos: 71,
  },
  {
    profissionalId: "diego",
    profissionalNome: "Diego Lima",
    atendimentos: 67,
    faturamento: 4154,
    ticketMedio: 62,
    clientesDistintos: 54,
  },
];

export const TICKET_CLIENTE_MOCK: TicketMedioCliente[] = [
  {
    clienteId: "c1",
    clienteNome: "João Silva",
    visitas: 8,
    totalGasto: 580,
    ticketMedio: 72.5,
    ultimaVisita: "2026-04-22",
  },
  {
    clienteId: "c5",
    clienteNome: "Fábio Neto",
    visitas: 6,
    totalGasto: 510,
    ticketMedio: 85,
    ultimaVisita: "2026-04-25",
  },
  {
    clienteId: "c2",
    clienteNome: "Ana Costa",
    visitas: 5,
    totalGasto: 380,
    ticketMedio: 76,
    ultimaVisita: "2026-04-18",
  },
  {
    clienteId: "c6",
    clienteNome: "Lucas Mendes",
    visitas: 4,
    totalGasto: 240,
    ticketMedio: 60,
    ultimaVisita: "2026-04-15",
  },
  {
    clienteId: "c7",
    clienteNome: "Marcelo Tavares",
    visitas: 3,
    totalGasto: 195,
    ticketMedio: 65,
    ultimaVisita: "2026-04-10",
  },
];

// ─── Comissões (KAN-119 serviços, KAN-120 produtos) ──────────────────────────

export const COMISSAO_SERVICO_MOCK: ComissaoServico[] = [
  {
    profissionalId: "carlos",
    profissionalNome: "Carlos Barbeiro",
    servicosCount: 142,
    faturamentoBruto: 8520,
    taxa: 50,
    valorComissao: 4260,
  },
  {
    profissionalId: "marcos",
    profissionalNome: "Marcos Silva",
    servicosCount: 118,
    faturamentoBruto: 6490,
    taxa: 45,
    valorComissao: 2920.5,
  },
  {
    profissionalId: "rafael",
    profissionalNome: "Rafael Costa",
    servicosCount: 95,
    faturamentoBruto: 5800,
    taxa: 50,
    valorComissao: 2900,
  },
  {
    profissionalId: "diego",
    profissionalNome: "Diego Lima",
    servicosCount: 67,
    faturamentoBruto: 3920,
    taxa: 50,
    valorComissao: 1960,
  },
];

export const COMISSAO_PRODUTO_MOCK: ComissaoProduto[] = [
  {
    profissionalId: "carlos",
    profissionalNome: "Carlos Barbeiro",
    produtosCount: 22,
    faturamentoBruto: 710,
    taxa: 10,
    valorComissao: 71,
  },
  {
    profissionalId: "marcos",
    profissionalNome: "Marcos Silva",
    produtosCount: 14,
    faturamentoBruto: 472,
    taxa: 10,
    valorComissao: 47.2,
  },
  {
    profissionalId: "rafael",
    profissionalNome: "Rafael Costa",
    produtosCount: 8,
    faturamentoBruto: 375,
    taxa: 10,
    valorComissao: 37.5,
  },
];
