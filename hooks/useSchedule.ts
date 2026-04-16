/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import {
  SERVICOS,
  PROFISSIONAIS,
  AGENDAMENTOS_MOCK,
  type Agendamento,
} from "@/mock/schedule";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface BloqueioHorario {
  id: string;
  profissionalId: string; // "todos" para bloquear todos
  inicioMin: number;
  duracaoMin: number;
  motivo?: string;
  tipo: "bloqueio";
}

// ─── Helpers exportados ───────────────────────────────────────────────────────

export function getDuracao(ag: Agendamento, profId?: string): number {
  const targetProfId = profId ?? ag.profissionalId;
  const prof = PROFISSIONAIS.find((p) => p.id === targetProfId);
  const servico = SERVICOS.find((s) => s.id === ag.servicoId);
  // Suporte a campo _customDuracao para resize local
  return (
    (ag as any)._customDuracao ??
    prof?.tempos[ag.servicoId] ??
    servico?.tempoPadrao ??
    30
  );
}

/**
 * Retorna true se os dois intervalos [aInicio, aInicio+aDuracao) e
 * [bInicio, bInicio+bDuracao) se sobrepõem.
 */
export function checkOverlap(
  aInicio: number,
  aDuracao: number,
  bInicio: number,
  bDuracao: number,
): boolean {
  return aInicio < bInicio + bDuracao && aInicio + aDuracao > bInicio;
}

/**
 * Encontra todos os agendamentos e bloqueios que conflitam com o intervalo
 * informado para um dado profissional.
 *
 * @param agendamentos - lista completa de agendamentos
 * @param profissionalId - profissional-alvo
 * @param inicioMin - início proposto em minutos
 * @param duracao - duração proposta em minutos
 * @param excludeId - id a ignorar (o próprio agendamento sendo movido)
 * @param bloqueios - lista de bloqueios de horário
 */
export function findConflicts(
  agendamentos: Agendamento[],
  profissionalId: string,
  inicioMin: number,
  duracao: number,
  excludeId?: string,
  bloqueios?: BloqueioHorario[],
): Array<Agendamento | BloqueioHorario> {
  const result: Array<Agendamento | BloqueioHorario> = [];

  agendamentos.forEach((ag) => {
    if (excludeId && ag.id === excludeId) return;
    if (ag.profissionalId !== profissionalId) return;
    const d = getDuracao(ag);
    if (checkOverlap(inicioMin, duracao, ag.inicioMin, d)) {
      result.push(ag);
    }
  });

  bloqueios?.forEach((bl) => {
    if (bl.profissionalId !== profissionalId && bl.profissionalId !== "todos")
      return;
    if (checkOverlap(inicioMin, duracao, bl.inicioMin, bl.duracaoMin)) {
      result.push(bl);
    }
  });

  return result;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useSchedule() {
  const [agendamentos, setAgendamentos] =
    useState<Agendamento[]>(AGENDAMENTOS_MOCK);
  const [bloqueios, setBloqueios] = useState<BloqueioHorario[]>([]);

  const agPorProfissional = useMemo(() => {
    const map: Record<string, Agendamento[]> = {};
    PROFISSIONAIS.forEach((p) => (map[p.id] = []));
    agendamentos.forEach((ag) => {
      if (map[ag.profissionalId]) map[ag.profissionalId].push(ag);
    });
    return map;
  }, [agendamentos]);

  /** Cria um novo agendamento */
  const criar = (ag: Agendamento) => setAgendamentos((prev) => [...prev, ag]);

  /** Atualiza parcialmente um agendamento por id */
  const atualizar = (id: string, data: Partial<Agendamento>) =>
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a)),
    );

  /** Remove um agendamento por id */
  const remover = (id: string) =>
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));

  /**
   * Verifica se um agendamento pode ser movido para novo profissional/horário
   * sem conflito (não considera bloqueios aqui — use findConflicts para isso).
   */
  const podeMover = (
    ag: Agendamento,
    novoProfId: string,
    novoInicio: number,
  ): boolean => {
    const duracao = getDuracao(ag, novoProfId);
    const conflicts = findConflicts(
      agendamentos,
      novoProfId,
      novoInicio,
      duracao,
      ag.id,
      bloqueios,
    );
    return conflicts.length === 0;
  };

  /** Adiciona um bloco de indisponibilidade */
  const criarBloqueio = (bl: Omit<BloqueioHorario, "id" | "tipo">) =>
    setBloqueios((prev) => [
      ...prev,
      { ...bl, id: `bl_${Date.now()}`, tipo: "bloqueio" },
    ]);

  /** Remove um bloco de indisponibilidade */
  const removerBloqueio = (id: string) =>
    setBloqueios((prev) => prev.filter((b) => b.id !== id));

  return {
    agendamentos,
    setAgendamentos,
    bloqueios,
    agPorProfissional,
    criar,
    atualizar,
    remover,
    podeMover,
    criarBloqueio,
    removerBloqueio,
  };
}
