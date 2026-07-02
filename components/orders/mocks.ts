import type {
  Agendamento,
  CatalogoItem,
  Comanda,
  ComandaFormValues,
} from "@/types/orders.types";

const STORAGE_KEY = "mock:comandas";

/**
 * Catálogo mockado. Num app real isso viria dos hooks useAppointments /
 * useProducts / useServices já existentes no projeto — aqui é só pra
 * alimentar os selects e simular o CRUD sem backend.
 */
export const MOCK_AGENDAMENTOS: Agendamento[] = [
  {
    id: "ag-1",
    clienteNome: "Lucas Andrade",
    profissionalNome: "João Barbeiro",
    servicoPrincipal: "Corte + Barba",
    horario: "2026-07-01T14:00:00",
  },
  {
    id: "ag-2",
    clienteNome: "Marcos Silva",
    profissionalNome: "Pedro Estilista",
    servicoPrincipal: "Corte Degradê",
    horario: "2026-07-01T15:30:00",
  },
  {
    id: "ag-3",
    clienteNome: "Rafael Costa",
    profissionalNome: "João Barbeiro",
    servicoPrincipal: "Barba Terapia",
    horario: "2026-07-01T16:15:00",
  },
  {
    id: "ag-4",
    clienteNome: "Bruno Melo",
    profissionalNome: "Carlos Junior",
    servicoPrincipal: "Corte Social",
    horario: "2026-07-02T09:00:00",
  },
  {
    id: "ag-5",
    clienteNome: "Diego Fernandes",
    profissionalNome: "Pedro Estilista",
    servicoPrincipal: "Platinado",
    horario: "2026-07-02T10:30:00",
  },
];

export const MOCK_CATEGORIAS_PRODUTOS = ["Todas", "Cabelo", "Barba", "Skincare"];

export const MOCK_PRODUTOS: CatalogoItem[] = [
  { id: "pr-1", nome: "Pomada Modeladora", categoria: "Cabelo", valor: 39.9 },
  { id: "pr-2", nome: "Shampoo Anticaspa", categoria: "Cabelo", valor: 29.9 },
  { id: "pr-3", nome: "Óleo para Barba", categoria: "Barba", valor: 34.5 },
  { id: "pr-4", nome: "Balm Pós-Barba", categoria: "Barba", valor: 27.0 },
  { id: "pr-5", nome: "Hidratante Facial", categoria: "Skincare", valor: 45.0 },
];

export const MOCK_CATEGORIAS_SERVICOS = ["Todas", "Cabelo", "Barba", "Combo"];

export const MOCK_SERVICOS: CatalogoItem[] = [
  { id: "sv-1", nome: "Corte Social", categoria: "Cabelo", valor: 45.0 },
  { id: "sv-2", nome: "Corte Degradê", categoria: "Cabelo", valor: 55.0 },
  { id: "sv-3", nome: "Barba Terapia", categoria: "Barba", valor: 40.0 },
  { id: "sv-4", nome: "Corte + Barba", categoria: "Combo", valor: 85.0 },
  { id: "sv-5", nome: "Platinado", categoria: "Combo", valor: 180.0 },
];

const SEED_COMANDAS: Comanda[] = [
  {
    id: "cm-1",
    numero: 1024,
    agendamentoId: "ag-1",
    status: "ABERTA",
    itens: [
      {
        id: "it-1",
        tipo: "SERVICO",
        catalogoId: "sv-4",
        nome: "Corte + Barba",
        categoria: "Combo",
        quantidade: 1,
        valorUnitario: 85.0,
      },
      {
        id: "it-2",
        tipo: "PRODUTO",
        catalogoId: "pr-3",
        nome: "Óleo para Barba",
        categoria: "Barba",
        quantidade: 1,
        valorUnitario: 34.5,
      },
    ],
    createdAt: "2026-07-01T14:05:00",
    updatedAt: "2026-07-01T14:10:00",
  },
  {
    id: "cm-2",
    numero: 1025,
    agendamentoId: "ag-2",
    status: "FECHADA",
    itens: [
      {
        id: "it-3",
        tipo: "SERVICO",
        catalogoId: "sv-2",
        nome: "Corte Degradê",
        categoria: "Cabelo",
        quantidade: 1,
        valorUnitario: 55.0,
      },
    ],
    createdAt: "2026-07-01T15:32:00",
    updatedAt: "2026-07-01T15:50:00",
  },
  {
    id: "cm-3",
    numero: 1026,
    agendamentoId: "ag-3",
    status: "CANCELADA",
    itens: [
      {
        id: "it-4",
        tipo: "SERVICO",
        catalogoId: "sv-3",
        nome: "Barba Terapia",
        categoria: "Barba",
        quantidade: 1,
        valorUnitario: 40.0,
      },
    ],
    observacoes: "Cliente cancelou em cima da hora.",
    createdAt: "2026-07-01T16:18:00",
    updatedAt: "2026-07-01T16:20:00",
  },
];

function readAll(): Comanda[] {
  if (typeof window === "undefined") return SEED_COMANDAS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_COMANDAS));
    return SEED_COMANDAS;
  }
  try {
    return JSON.parse(raw) as Comanda[];
  } catch {
    return SEED_COMANDAS;
  }
}

function writeAll(comandas: Comanda[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comandas));
}

function nextNumero(comandas: Comanda[]) {
  const max = comandas.reduce((acc, c) => Math.max(acc, c.numero), 1000);
  return max + 1;
}

export function calcularTotal(comanda: Pick<Comanda, "itens">) {
  return comanda.itens.reduce(
    (acc, item) => acc + item.quantidade * item.valorUnitario,
    0,
  );
}

export function getAgendamento(id: string) {
  return MOCK_AGENDAMENTOS.find((a) => a.id === id);
}

export const mockComandasStore = {
  list(): Comanda[] {
    return readAll().sort((a, b) => b.numero - a.numero);
  },

  get(id: string): Comanda | undefined {
    return readAll().find((c) => c.id === id);
  },

  create(values: ComandaFormValues): Comanda {
    const all = readAll();
    const now = new Date().toISOString();
    const comanda: Comanda = {
      id: `cm-${Date.now()}`,
      numero: nextNumero(all),
      agendamentoId: values.agendamentoId,
      status: "ABERTA",
      itens: values.itens,
      observacoes: values.observacoes,
      createdAt: now,
      updatedAt: now,
    };
    writeAll([...all, comanda]);
    return comanda;
  },

  update(id: string, values: ComandaFormValues): Comanda | undefined {
    const all = readAll();
    let updated: Comanda | undefined;
    const next = all.map((c) => {
      if (c.id !== id) return c;
      updated = {
        ...c,
        agendamentoId: values.agendamentoId,
        itens: values.itens,
        observacoes: values.observacoes,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
    writeAll(next);
    return updated;
  },

  updateStatus(id: string, status: Comanda["status"]): Comanda | undefined {
    const all = readAll();
    let updated: Comanda | undefined;
    const next = all.map((c) => {
      if (c.id !== id) return c;
      updated = { ...c, status, updatedAt: new Date().toISOString() };
      return updated;
    });
    writeAll(next);
    return updated;
  },

  remove(id: string) {
    const all = readAll();
    writeAll(all.filter((c) => c.id !== id));
  },

  reset() {
    writeAll(SEED_COMANDAS);
  },
};