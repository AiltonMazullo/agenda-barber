import type { AgendamentoVM, BloqueioHorario, SlotSize } from "./types";

/** "510" → "08:30" */
export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "08:30" → 510 */
export function timeToMin(time: string): number {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

/** True se duas datas são o mesmo dia (fuso local). */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Data ISO ("yyyy-MM-dd") de um `Date`, no fuso local. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Dia (fuso local) de um `scheduledAt` ISO, como "yyyy-MM-dd". */
export function localDateIso(iso: string): string {
  return toDateInputValue(new Date(iso));
}

/**
 * Grade de dias do mês de `center`, preenchida até completar semanas
 * inteiras (de domingo a sábado) — inclui dias do mês anterior/seguinte.
 */
export function buildMonthDates(center: Date): Date[] {
  const firstOfMonth = new Date(center.getFullYear(), center.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - start.getDay());
  const lastOfMonth = new Date(center.getFullYear(), center.getMonth() + 1, 0);
  const end = new Date(lastOfMonth);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
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

/** Minutos desde meia-noite UTC de uma data ISO. */
export function isoToMin(iso: string): number {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
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
