"use client";

import { useState, useCallback, useMemo } from "react";
import { CONTRATOS_MOCK, PLANOS_MOCK } from "@/mock/subscriptions";
import type {
  ContratoStatus,
  Contrato,
  Plano,
} from "@/types/subscription.types";

function gerarPlanoId(): string {
  return `plano_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

function gerarContratoId(): string {
  return `contrato_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

/**
 * Hook central de assinaturas: planos, contratos, e operações relacionadas.
 *
 * Quando o backend existir, este hook será o único ponto que muda
 * (substitui mock + setters por chamadas ao service).
 */
export function useSubscriptions() {
  const [planos, setPlanos] = useState<Plano[]>(PLANOS_MOCK);
  const [contratos, setContratos] = useState<Contrato[]>(CONTRATOS_MOCK);

  // ─── Computed ─────────────────────────────────────────────────────────────

  const resumo = useMemo(() => {
    const ativos = contratos.filter((c) => c.status === "ativo");
    const inadimplentes = contratos.filter((c) => c.status === "inadimplente");
    const cancelados = contratos.filter((c) => c.status === "cancelado");
    const preAprovados = contratos.filter((c) => c.status === "pre_aprovado");
    const preCancelados = contratos.filter(
      (c) => c.status === "pre_cancelado",
    );

    const totalGateway = contratos
      .filter((c) => c.origem === "gateway" && c.status === "ativo")
      .reduce((acc, c) => acc + c.valor, 0);
    const totalManual = contratos
      .filter((c) => c.origem === "manual" && c.status === "ativo")
      .reduce((acc, c) => acc + c.valor, 0);

    return {
      ativos: ativos.length,
      inadimplentes: inadimplentes.length,
      cancelados: cancelados.length,
      preAprovados: preAprovados.length,
      preCancelados: preCancelados.length,
      total: contratos.length,
      totalGateway,
      totalManual,
      totalGeral: totalGateway + totalManual,
    };
  }, [contratos]);

  // ─── Planos (KAN-139/140/141) ─────────────────────────────────────────────

  const criarPlano = useCallback((dados: Omit<Plano, "id">) => {
    const novo: Plano = { ...dados, id: gerarPlanoId() };
    setPlanos((prev) => [...prev, novo]);
    return novo;
  }, []);

  const atualizarPlano = useCallback(
    (id: string, patch: Partial<Plano>) => {
      setPlanos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
    },
    [],
  );

  const removerPlano = useCallback((id: string) => {
    setPlanos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ─── Contratos (KAN-138/142) ──────────────────────────────────────────────

  const criarContrato = useCallback((dados: Omit<Contrato, "id">) => {
    const novo: Contrato = { ...dados, id: gerarContratoId() };
    setContratos((prev) => [novo, ...prev]);
    return novo;
  }, []);

  const atualizarContrato = useCallback(
    (id: string, patch: Partial<Contrato>) => {
      setContratos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  const removerContrato = useCallback((id: string) => {
    setContratos((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const alterarStatus = useCallback(
    (id: string, status: ContratoStatus) => {
      atualizarContrato(id, { status });
    },
    [atualizarContrato],
  );

  return {
    planos,
    contratos,
    resumo,
    criarPlano,
    atualizarPlano,
    removerPlano,
    criarContrato,
    atualizarContrato,
    removerContrato,
    alterarStatus,
  };
}
