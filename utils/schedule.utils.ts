import { PROFISSIONAIS, SERVICOS, type Agendamento } from "@/mock/schedule";
import {
  START_HOUR,
  type BloqueioHorario,
  type SlotSize,
} from "@/types/schedule.types";

/** Agendamento estendido com sobrescrita local de duração (resize). */
export type AgendamentoComCustom = Agendamento & {
  _customDuracao?: number;
};

/** Duração efetiva do agendamento — respeita override local e tempo do profissional. */
export function getDuracao(ag: Agendamento, profId?: string): number {
  const targetProfId = profId ?? ag.profissionalId;
  const prof = PROFISSIONAIS.find((p) => p.id === targetProfId);
  const servico = SERVICOS.find((s) => s.id === ag.servicoId);
  return (
    (ag as AgendamentoComCustom)._customDuracao ??
    prof?.tempos[ag.servicoId] ??
    servico?.tempoPadrao ??
    30
  );
}

/** Converte minutos desde meia-noite em "HH:mm". */
export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Arredonda minutos para o slot mais próximo. */
export function snapToSlot(min: number, slotSize: SlotSize): number {
  return Math.round(min / slotSize) * slotSize;
}

/** Gera ID único para agendamento (mock). */
export function gerarAgendamentoId(): string {
  return `ag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** True se dois intervalos `[inicio, inicio+duracao)` se sobrepõem. */
export function checkOverlap(
  aInicio: number,
  aDuracao: number,
  bInicio: number,
  bDuracao: number,
): boolean {
  const aFim = aInicio + aDuracao;
  const bFim = bInicio + bDuracao;
  return aInicio < bFim && aFim > bInicio;
}

/**
 * Encontra agendamentos e bloqueios que conflitam com o intervalo proposto.
 *
 * @param excludeId - ID do agendamento sendo movido (ignora a si mesmo)
 */
export function findConflicts(
  agendamentos: Agendamento[],
  profissionalId: string,
  inicioMin: number,
  duracao: number,
  excludeId?: string,
  bloqueios?: BloqueioHorario[],
): Array<Agendamento | BloqueioHorario> {
  const conflicts: Array<Agendamento | BloqueioHorario> = [];

  agendamentos.forEach((ag) => {
    if (excludeId && ag.id === excludeId) return;
    if (ag.profissionalId !== profissionalId) return;
    const d = getDuracao(ag);
    if (checkOverlap(inicioMin, duracao, ag.inicioMin, d)) {
      conflicts.push(ag);
    }
  });

  bloqueios?.forEach((bl) => {
    if (
      bl.profissionalId !== profissionalId &&
      bl.profissionalId !== "todos"
    ) {
      return;
    }
    if (checkOverlap(inicioMin, duracao, bl.inicioMin, bl.duracaoMin)) {
      conflicts.push(bl);
    }
  });

  return conflicts;
}

/** Calcula posição vertical (px) do horário "agora" no grid, ou null fora do expediente. */
export function calcNowTopPx(
  slotSize: SlotSize,
  slotHeightPx: number,
  endHour: number,
): number | null {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < START_HOUR * 60 || nowMin > endHour * 60) return null;
  return ((nowMin - START_HOUR * 60) / slotSize) * slotHeightPx;
}
