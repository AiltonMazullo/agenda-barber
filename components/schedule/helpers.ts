import type { AgendamentoVM, BloqueioHorario, SlotSize } from "./types";

/** "510" → "08:30" */
export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function snapToSlot(min: number, slotSize: SlotSize): number {
  return Math.round(min / slotSize) * slotSize;
}

export function gerarId(): string {
  return `bl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Iniciais (até 2 letras) de um nome. */
export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

/** Minutos desde meia-noite de uma data ISO (no fuso local). */
export function isoToMin(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** True se dois intervalos [inicio, inicio+dur) se sobrepõem. */
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

/** Encontra agendamentos/bloqueios conflitantes (excluindo o próprio). */
export function findConflicts(
  agendamentos: AgendamentoVM[],
  profissionalId: string,
  inicioMin: number,
  duracao: number,
  excludeId?: string,
  bloqueios?: BloqueioHorario[],
): Array<AgendamentoVM | BloqueioHorario> {
  const conflicts: Array<AgendamentoVM | BloqueioHorario> = [];

  agendamentos.forEach((ag) => {
    if (excludeId && ag.id === excludeId) return;
    if (ag.profissionalId !== profissionalId) return;
    if (checkOverlap(inicioMin, duracao, ag.inicioMin, ag.duracao)) {
      conflicts.push(ag);
    }
  });

  bloqueios?.forEach((bl) => {
    if (bl.profissionalId !== profissionalId && bl.profissionalId !== "todos")
      return;
    if (checkOverlap(inicioMin, duracao, bl.inicioMin, bl.duracaoMin)) {
      conflicts.push(bl);
    }
  });

  return conflicts;
}

export function isBloqueio(
  c: AgendamentoVM | BloqueioHorario,
): c is BloqueioHorario {
  return (c as BloqueioHorario).tipo === "bloqueio";
}
