// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Servico = {
  id: string;
  nome: string;
  cor: string; // tailwind bg class
  tempoPadrao: number; // minutos
  preco: number; // R$
};

export type Profissional = {
  id: string;
  nome: string;
  avatar: string; // 2 letras
  ativo: boolean;
  tempos: Record<string, number>; // servicoId -> minutos personalizados
};

export type Agendamento = {
  id: string;
  servicoId: string;
  profissionalId: string;
  cliente: string;
  telefone: string;
  inicioMin: number; // minutos desde meia-noite
  observacao?: string;
  origem: "online" | "recepcao";
};

// ─── Serviços ─────────────────────────────────────────────────────────────────

export const SERVICOS: Servico[] = [
  { id: "corte", nome: "Corte", cor: "bg-blue-500", tempoPadrao: 30, preco: 35 },
  { id: "barba", nome: "Barba", cor: "bg-amber-500", tempoPadrao: 20, preco: 25 },
  { id: "corte_barba", nome: "Corte + Barba", cor: "bg-purple-500", tempoPadrao: 50, preco: 55 },
  { id: "sobrancelha", nome: "Sobrancelha", cor: "bg-emerald-500", tempoPadrao: 15, preco: 15 },
  { id: "pigmentacao", nome: "Pigmentação", cor: "bg-red-500", tempoPadrao: 60, preco: 80 },
  { id: "hidratacao", nome: "Hidratação", cor: "bg-cyan-500", tempoPadrao: 40, preco: 50 },
];

// ─── Profissionais ────────────────────────────────────────────────────────────

export const PROFISSIONAIS: Profissional[] = [
  {
    id: "carlos",
    nome: "Carlos",
    avatar: "CA",
    ativo: true,
    tempos: {
      corte: 40,
      barba: 20,
      corte_barba: 60,
      sobrancelha: 15,
      pigmentacao: 75,
      hidratacao: 45,
    },
  },
  {
    id: "marcos",
    nome: "Marcos",
    avatar: "MA",
    ativo: true,
    tempos: {
      corte: 25,
      barba: 15,
      corte_barba: 40,
      sobrancelha: 10,
      pigmentacao: 60,
      hidratacao: 35,
    },
  },
  {
    id: "rafael",
    nome: "Rafael",
    avatar: "RA",
    ativo: true,
    tempos: {
      corte: 30,
      barba: 20,
      corte_barba: 50,
      sobrancelha: 15,
      pigmentacao: 70,
      hidratacao: 40,
    },
  },
  {
    id: "diego",
    nome: "Diego",
    avatar: "DI",
    ativo: true,
    tempos: {
      corte: 35,
      barba: 25,
      corte_barba: 55,
      sobrancelha: 20,
      pigmentacao: 80,
      hidratacao: 50,
    },
  },
];

// ─── Agendamentos ─────────────────────────────────────────────────────────────

export const AGENDAMENTOS_MOCK: Agendamento[] = [
  {
    id: "a1",
    servicoId: "corte",
    profissionalId: "carlos",
    cliente: "João Silva",
    telefone: "(81) 99999-0001",
    inicioMin: 8 * 60,
    origem: "online",
  },
  {
    id: "a2",
    servicoId: "barba",
    profissionalId: "carlos",
    cliente: "Pedro Lima",
    telefone: "(81) 99999-0002",
    inicioMin: 9 * 60 + 10,
    origem: "recepcao",
    observacao: "Cliente preferencial",
  },
  {
    id: "a3",
    servicoId: "corte_barba",
    profissionalId: "marcos",
    cliente: "Ana Costa",
    telefone: "(81) 99999-0003",
    inicioMin: 8 * 60 + 30,
    origem: "online",
  },
  {
    id: "a4",
    servicoId: "sobrancelha",
    profissionalId: "marcos",
    cliente: "Luiz Mota",
    telefone: "(81) 99999-0004",
    inicioMin: 10 * 60,
    origem: "recepcao",
  },
  {
    id: "a5",
    servicoId: "pigmentacao",
    profissionalId: "rafael",
    cliente: "Bruno Alves",
    telefone: "(81) 99999-0005",
    inicioMin: 9 * 60,
    origem: "online",
    observacao: "Primeira vez",
  },
  {
    id: "a6",
    servicoId: "corte",
    profissionalId: "diego",
    cliente: "Fábio Neto",
    telefone: "(81) 99999-0006",
    inicioMin: 11 * 60,
    origem: "recepcao",
  },
  {
    id: "a7",
    servicoId: "barba",
    profissionalId: "rafael",
    cliente: "Claudio Reis",
    telefone: "(81) 99999-0007",
    inicioMin: 14 * 60,
    origem: "online",
  },
  {
    id: "a8",
    servicoId: "corte_barba",
    profissionalId: "carlos",
    cliente: "Thiago Duarte",
    telefone: "(81) 99999-0008",
    inicioMin: 14 * 60 + 30,
    origem: "recepcao",
    observacao: "Aniversariante",
  },
  {
    id: "a9",
    servicoId: "hidratacao",
    profissionalId: "diego",
    cliente: "Marcus Vinícius",
    telefone: "(81) 99999-0009",
    inicioMin: 13 * 60,
    origem: "online",
  },
  {
    id: "a10",
    servicoId: "sobrancelha",
    profissionalId: "rafael",
    cliente: "Ricardo Gomes",
    telefone: "(81) 99999-0010",
    inicioMin: 16 * 60,
    origem: "recepcao",
  },
];