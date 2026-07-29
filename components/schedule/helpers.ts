import type { EmployeeBreak, EmployeeSchedule, EmployeeTimeOff } from "@/types/employee.types";
import type { Holiday } from "@/types/holiday.types";
import {
  END_HOUR,
  START_HOUR,
  type AgendamentoVM,
  type BloqueioHorario,
  type Indisponibilidade,
  type SlotSize,
} from "./types";

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

/**
 * Dia de um `scheduledAt` ISO, como "yyyy-MM-dd". `scheduledAt` guarda a
 * hora de parede local disfarçada de UTC (ver isoToMin acima), então lemos
 * os componentes via getUTC*() — new Date(iso) + toDateInputValue (que usa
 * getters locais) reconverteria pelo fuso real do browser e poderia
 * devolver o dia errado perto da meia-noite.
 */
export function localDateIso(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

/**
 * Deriva os segmentos de indisponibilidade (fora do expediente, intervalo,
 * feriado, folga) de um profissional pro dia selecionado, a partir da
 * configuração persistida (horários/intervalos/folgas do profissional +
 * feriado da filial no dia). Espelha a mesma ordem de prioridade usada em
 * `assertSlotAvailable` (agendle-api `appointments.service.ts`): folga >
 * feriado fechado > horário especial de feriado (substitui o expediente
 * normal) > expediente normal + intervalos. Puramente pra exibição — a
 * validação real continua no backend.
 */
export function buildIndisponibilidades(params: {
  profissionalId: string;
  selectedDate: Date;
  schedules: EmployeeSchedule[];
  breaks: EmployeeBreak[];
  timeOff: EmployeeTimeOff[];
  holidayHoje?: Holiday | null;
}): Indisponibilidade[] {
  const { profissionalId, selectedDate, schedules, breaks, timeOff, holidayHoje } = params;
  const gridStart = START_HOUR * 60;
  const gridEnd = END_HOUR * 60;
  const dateIso = toDateInputValue(selectedDate);
  const dayOfWeek = selectedDate.getDay();

  const emFolga = timeOff.some((t) => t.startDate <= dateIso && dateIso <= t.endDate);
  if (emFolga) {
    return [
      {
        id: `folga-${profissionalId}`,
        profissionalId,
        inicioMin: gridStart,
        fimMin: gridEnd,
        tipo: "folga",
        label: "Folga",
      },
    ];
  }

  if (holidayHoje?.status === "CLOSED") {
    return [
      {
        id: `feriado-${profissionalId}`,
        profissionalId,
        inicioMin: gridStart,
        fimMin: gridEnd,
        tipo: "feriado",
        label: `Feriado — ${holidayHoje.name}`,
      },
    ];
  }

  let workStart: number;
  let workEnd: number;
  if (holidayHoje?.status === "OPEN" && holidayHoje.startTime && holidayHoje.endTime) {
    workStart = timeToMin(holidayHoje.startTime);
    workEnd = timeToMin(holidayHoje.endTime);
  } else {
    const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!schedule) {
      return [
        {
          id: `fora-${profissionalId}`,
          profissionalId,
          inicioMin: gridStart,
          fimMin: gridEnd,
          tipo: "fora-expediente",
          label: "Fora do expediente",
        },
      ];
    }
    workStart = timeToMin(schedule.startTime);
    workEnd = timeToMin(schedule.endTime);
  }

  const segments: Indisponibilidade[] = [];
  if (workStart > gridStart) {
    segments.push({
      id: `antes-${profissionalId}`,
      profissionalId,
      inicioMin: gridStart,
      fimMin: Math.min(workStart, gridEnd),
      tipo: "fora-expediente",
      label: "Fora do expediente",
    });
  }
  if (workEnd < gridEnd) {
    segments.push({
      id: `depois-${profissionalId}`,
      profissionalId,
      inicioMin: Math.max(workEnd, gridStart),
      fimMin: gridEnd,
      tipo: "fora-expediente",
      label: "Fora do expediente",
    });
  }

  breaks
    .filter((b) => b.dayOfWeek === dayOfWeek)
    .forEach((b) => {
      const s = Math.max(timeToMin(b.startTime), gridStart);
      const e = Math.min(timeToMin(b.endTime), gridEnd);
      if (e > s) {
        segments.push({
          id: `intervalo-${b.id}`,
          profissionalId,
          inicioMin: s,
          fimMin: e,
          tipo: "intervalo",
          label: "Intervalo",
        });
      }
    });

  return segments;
}
