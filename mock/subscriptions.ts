import type { Contrato, Plano } from "@/types/subscription.types";

export const PLANOS_MOCK: Plano[] = [
  {
    id: "plano_essential",
    nome: "Essential",
    preco: 79.9,
    ciclo: "mensal",
    beneficios: ["1 corte/mês", "10% desconto produtos"],
    ativo: true,
  },
  {
    id: "plano_pro",
    nome: "Pro Cabelo",
    preco: 149.9,
    ciclo: "mensal",
    beneficios: ["2 cortes/mês", "1 barba/mês", "15% desconto produtos"],
    ativo: true,
  },
  {
    id: "plano_max",
    nome: "Max",
    preco: 249.9,
    ciclo: "mensal",
    beneficios: [
      "Cortes ilimitados",
      "Barba ilimitada",
      "Hidratação inclusa",
      "20% desconto produtos",
    ],
    ativo: true,
  },
];

export const CONTRATOS_MOCK: Contrato[] = [];
