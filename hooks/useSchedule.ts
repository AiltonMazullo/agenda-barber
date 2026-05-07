import { useState, useMemo, useCallback } from "react";
import {
  AGENDAMENTOS_MOCK,
  PROFISSIONAIS,
  type Agendamento,
} from "@/mock/schedule";
import type { BloqueioHorario } from "@/types/schedule.types";
import { findConflicts, gerarAgendamentoId, getDuracao } from "@/utils/schedule.utils";

/**
 * Hook central da agenda: gerencia agendamentos + bloqueios + verificações de conflito.
 *
 * Quando o backend existir, este hook deve ser o único ponto que muda
 * (substitui o estado local por chamadas ao service).
 */
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

  const criar = useCallback((dados: Omit<Agendamento, "id">) => {
    setAgendamentos((prev) => [...prev, { ...dados, id: gerarAgendamentoId() }]);
  }, []);

  const atualizar = useCallback(
    (id: string, data: Partial<Agendamento>) => {
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a)),
      );
    },
    [],
  );

  const remover = useCallback((id: string) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  }, []);

  /**
   * Verifica se um agendamento pode mover para novo profissional/horário sem
   * conflito com outros agendamentos ou bloqueios.
   */
  const podeMover = useCallback(
    (ag: Agendamento, novoProfId: string, novoInicio: number): boolean => {
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
    },
    [agendamentos, bloqueios],
  );

  const criarBloqueio = useCallback(
    (bl: Omit<BloqueioHorario, "id" | "tipo">) => {
      setBloqueios((prev) => [
        ...prev,
        { ...bl, id: `bl_${Date.now()}`, tipo: "bloqueio" },
      ]);
    },
    [],
  );

  const removerBloqueio = useCallback((id: string) => {
    setBloqueios((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return {
    agendamentos,
    setAgendamentos,
    bloqueios,
    setBloqueios,
    agPorProfissional,
    criar,
    atualizar,
    remover,
    podeMover,
    criarBloqueio,
    removerBloqueio,
  };
}
