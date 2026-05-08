"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CONTAS_PAGAR_MOCK,
  CONTAS_RECEBER_MOCK,
  CATEGORIAS_FINANCEIRAS_MOCK,
  COMISSOES_PENDENTES_MOCK,
} from "@/mock/financial";
import type {
  CategoriaFinanceira,
  ComissaoPendente,
  Conta,
  ResumoContas,
  ResumoContasReceber,
} from "@/types/financial.types";

function gerarContaId(): string {
  return `conta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function gerarCategoriaId(): string {
  return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function isVencida(conta: Conta): boolean {
  if (conta.status !== "pendente") return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(conta.vencimento) < hoje;
}

function computeResumoPagar(contas: Conta[]): ResumoContas {
  const result: ResumoContas = {
    vencidos: 0,
    aVencer: 0,
    pagos: 0,
    total: 0,
  };
  contas.forEach((c) => {
    if (c.status === "pago") result.pagos += c.valor;
    else if (c.status === "atrasado" || isVencida(c)) result.vencidos += c.valor;
    else result.aVencer += c.valor;
    result.total += c.valor;
  });
  return result;
}

function computeResumoReceber(contas: Conta[]): ResumoContasReceber {
  const result: ResumoContasReceber = {
    naoRecebidos: 0,
    aReceber: 0,
    recebidos: 0,
    total: 0,
  };
  contas.forEach((c) => {
    if (c.status === "pago") result.recebidos += c.valor;
    else if (c.status === "atrasado" || isVencida(c)) result.naoRecebidos += c.valor;
    else result.aReceber += c.valor;
    result.total += c.valor;
  });
  return result;
}

/**
 * Hook central de financeiro: gerencia contas a pagar/receber, categorias,
 * comissões pendentes e expõe totais computados dinamicamente.
 *
 * Quando o backend existir, este hook é o único ponto que muda
 * (substitui mock + setters por chamadas ao service).
 */
export function useFinancial() {
  const [contasPagar, setContasPagar] = useState<Conta[]>(CONTAS_PAGAR_MOCK);
  const [contasReceber, setContasReceber] =
    useState<Conta[]>(CONTAS_RECEBER_MOCK);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>(
    CATEGORIAS_FINANCEIRAS_MOCK,
  );
  const [comissoesPendentes, setComissoesPendentes] = useState<
    ComissaoPendente[]
  >(COMISSOES_PENDENTES_MOCK);

  const resumoPagar = useMemo(
    () => computeResumoPagar(contasPagar),
    [contasPagar],
  );
  const resumoReceber = useMemo(
    () => computeResumoReceber(contasReceber),
    [contasReceber],
  );
  const balanco = useMemo(
    () => ({
      atual: resumoReceber.recebidos - resumoPagar.pagos,
      projetado: resumoReceber.total - resumoPagar.total,
    }),
    [resumoReceber, resumoPagar],
  );

  // ─── Contas ───────────────────────────────────────────────────────────────

  const criarConta = useCallback(
    (dados: Omit<Conta, "id">) => {
      const nova: Conta = { ...dados, id: gerarContaId() };
      if (nova.tipo === "pagar") setContasPagar((prev) => [nova, ...prev]);
      else setContasReceber((prev) => [nova, ...prev]);
      return nova;
    },
    [],
  );

  const atualizarConta = useCallback(
    (id: string, patch: Partial<Conta>) => {
      const updater = (prev: Conta[]) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      setContasPagar(updater);
      setContasReceber(updater);
    },
    [],
  );

  const removerConta = useCallback((id: string) => {
    setContasPagar((prev) => prev.filter((c) => c.id !== id));
    setContasReceber((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const marcarComoPago = useCallback(
    (id: string) => atualizarConta(id, { status: "pago" }),
    [atualizarConta],
  );

  // ─── Categorias ───────────────────────────────────────────────────────────

  const criarCategoria = useCallback(
    (dados: Omit<CategoriaFinanceira, "id">) => {
      const nova: CategoriaFinanceira = { ...dados, id: gerarCategoriaId() };
      setCategorias((prev) => [...prev, nova]);
      return nova;
    },
    [],
  );

  const removerCategoria = useCallback((id: string) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ─── Comissões (KAN-143) ──────────────────────────────────────────────────

  /** Cria contas a pagar para os IDs de comissões selecionadas e remove-os da lista pendente. */
  const gerarComissoesSelecionadas = useCallback(
    (ids: string[]): number => {
      if (ids.length === 0) return 0;
      const hoje = new Date().toISOString().slice(0, 10);
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + 5);
      const venc = vencimento.toISOString().slice(0, 10);

      const novasContas: Conta[] = comissoesPendentes
        .filter((c) => ids.includes(c.id))
        .map((c) => ({
          id: gerarContaId(),
          tipo: "pagar",
          descricao: `Comissão ${c.profissionalNome} (${c.periodoInicio} → ${c.periodoFim})`,
          categoria: "Comissões",
          vencimento: venc,
          forma: "pix",
          valor: c.valorComissao,
          status: "pendente",
          observacao: `Gerado em ${hoje}. ${c.servicosCount} serviços, ${c.produtosCount} produtos.`,
        }));

      setContasPagar((prev) => [...novasContas, ...prev]);
      setComissoesPendentes((prev) => prev.filter((c) => !ids.includes(c.id)));
      return novasContas.length;
    },
    [comissoesPendentes],
  );

  return {
    contasPagar,
    contasReceber,
    categorias,
    comissoesPendentes,
    resumoPagar,
    resumoReceber,
    balanco,
    criarConta,
    atualizarConta,
    removerConta,
    marcarComoPago,
    criarCategoria,
    removerCategoria,
    gerarComissoesSelecionadas,
  };
}
