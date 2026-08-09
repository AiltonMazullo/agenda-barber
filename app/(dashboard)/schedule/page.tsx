"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
  User,
  Ban,
  Receipt,
  LayoutList,
  LayoutGrid,
  Building2,
  CalendarOff,
  CalendarRange,
  ClipboardList,
  ExternalLink,
} from "lucide-react";
// (Scissors removido — a orientação textual da legenda foi substituída)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useSchedule } from "@/hooks/useSchedule";
import { useHolidays } from "@/hooks/useHolidays";
import { useScheduleBlocks } from "@/hooks/useScheduleBlocks";
import { useEmployeeAvailability } from "@/hooks/useEmployeeAvailability";
import { useComandas } from "@/hooks/useComandas";
import { DialogFecharComanda } from "@/components/orders";
import { comandaToDraft } from "@/utils/comanda";
import type { Comanda } from "@/types/orders.types";
import {
  AgendamentoCard,
  ProfissionalColuna,
  TimeLine,
  ModoLista,
  AgendaMonthGrid,
  ResumoDia,
  IconLegend,
  ColorLegend,
  DialogNovoAgendamento,
  DialogDetalhe,
  DialogConflito,
  DialogNovaComanda,
  DialogComandaAgendamento,
  DialogNovoBloqueio,
  DropdownButton,
  findConflicts,
  isBloqueio,
  minToTime,
  snapToSlot,
  buildMonthDates,
  buildIndisponibilidades,
  localDateIso,
  toDateInputValue,
  SLOT_OPTIONS,
  START_HOUR,
  END_HOUR,
  SEM_PREFERENCIA_ID,
} from "@/components/schedule";
import type {
  AgendamentoVM,
  BloqueioHorario,
  ConflitoDados,
  Indisponibilidade,
  NovoAgendamentoInput,
  NovoBloqueioInput,
  ProfissionalVM,
  SlotSize,
  ViewMode,
} from "@/components/schedule";
import type { UpdatableAppointmentStatus } from "@/types/appointment.types";
import { Loading, DatePickerField } from "@/components/shared";

/** Pseudo-profissional só para dar uma coluna própria aos agendamentos "sem preferência" na grade — não corresponde a um Employee real. */
const PROFISSIONAL_SEM_PREFERENCIA: ProfissionalVM = {
  id: SEM_PREFERENCIA_ID,
  nome: "Sem preferência",
  avatar: "?",
  ativo: true,
  branchId: null,
};

export default function SchedulePage() {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { holidays } = useHolidays(barbershop?.id);
  const {
    comandas,
    create: createComanda,
    update: updateComanda,
    setStatus: setComandaStatus,
  } = useComandas(barbershop?.id);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [filialId, setFilialId] = useState<string>("");

  // Define a primeira filial assim que carregarem
  useEffect(() => {
    if (!filialId && branches.length > 0) setFilialId(branches[0].id);
  }, [branches, filialId]);

  const {
    servicos,
    profissionais,
    profissionaisTodos,
    agendamentos,
    agendamentosTodos,
    clients,
    servicoById,
    isLoading,
    createAgendamento,
    createClient,
    updateStatus,
    cancel,
    moveLocal,
    resizeLocal,
    rescheduleAgendamento,
    resizeAgendamento,
    updateAgendamento,
    transferAgendamento,
    clientActivePlans,
  } = useSchedule(barbershop?.id, selectedDate, filialId || undefined);

  // Bloqueios de horário (persistidos — ver ajustes/Módulo Agenda.md)
  const {
    blocks: scheduleBlocks,
    create: createScheduleBlock,
    remove: removeScheduleBlock,
    update: updateScheduleBlock,
  } = useScheduleBlocks(barbershop?.id);

  // Horários/intervalos/folgas de cada profissional — pra derivar as
  // indisponibilidades exibidas na agenda (ver `buildIndisponibilidades`).
  const profissionalIds = useMemo(
    () => profissionais.map((p) => p.id),
    [profissionais],
  );
  const { schedulesByEmployee, breaksByEmployee, timeOffByEmployee } =
    useEmployeeAvailability(barbershop?.id, profissionalIds);

  const selectedDateIsoForBlocks = toDateInputValue(selectedDate);
  const bloqueios = useMemo<BloqueioHorario[]>(
    () =>
      scheduleBlocks
        .filter((b) => localDateIso(b.startAt) === selectedDateIsoForBlocks)
        .map((b) => {
          const start = new Date(b.startAt);
          const end = new Date(b.endAt);
          return {
            id: b.id,
            profissionalId: b.employeeId ?? "todos",
            inicioMin: start.getUTCHours() * 60 + start.getUTCMinutes(),
            duracaoMin: Math.round((end.getTime() - start.getTime()) / 60_000),
            motivo: b.reason || "Bloqueado",
            tipo: "bloqueio" as const,
            dataIso: localDateIso(b.startAt),
          };
        }),
    [scheduleBlocks, selectedDateIsoForBlocks],
  );

  // UI state
  const [slotSize, setSlotSize] = useState<SlotSize>(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filtroProf, setFiltroProf] = useState<string>("todos");
  const [modoBloquear, setModoBloquear] = useState(false);
  const [filtroComanda, setFiltroComanda] = useState<
    "nenhum" | "abertas" | "fechadas" | "antigas"
  >("nenhum");

  // Dialogs
  const [dialogNovo, setDialogNovo] = useState(false);
  const [submittingNovo, setSubmittingNovo] = useState(false);
  const [dialogDetalhe, setDialogDetalhe] = useState(false);
  const [agSelecionado, setAgSelecionado] = useState<AgendamentoVM | null>(null);
  const [dialogConflito, setDialogConflito] = useState(false);
  const [dadosConflito, setDadosConflito] = useState<ConflitoDados | null>(null);
  const [conflitoPendente, setConflitoPendente] = useState<{
    agId: string;
    novoProfId: string;
    novoInicio: number;
  } | null>(null);
  const [dialogComanda, setDialogComanda] = useState(false);
  const [dialogBloqueio, setDialogBloqueio] = useState(false);
  const [dialogComandaAgendamento, setDialogComandaAgendamento] = useState(false);
  const [agSelecionadoComanda, setAgSelecionadoComanda] =
    useState<AgendamentoVM | null>(null);
  const [fecharComandaTarget, setFecharComandaTarget] =
    useState<Comanda | null>(null);

  const [prefilledHora, setPrefilledHora] = useState<string | undefined>();
  const [prefilledProfId, setPrefilledProfId] = useState<string | undefined>();

  const SLOT_HEIGHT_PX = slotSize === 10 ? 28 : slotSize === 20 ? 40 : 56;

  // Início/fim da agenda = do primeiro ao último horário entre os
  // profissionais visíveis no dia selecionado (ver spec-revisao-cliente-1.md
  // §5.1) — cai para START_HOUR/END_HOUR fixos quando ninguém tem horário
  // cadastrado para o dia (ex.: filial recém-criada, sem profissionais).
  const dayOfWeek = selectedDate.getDay();
  const { startHour: gridStartHour, endHour: gridEndHour } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const p of profissionais) {
      const schedules = schedulesByEmployee.get(p.id) ?? [];
      for (const s of schedules) {
        if (s.dayOfWeek !== dayOfWeek) continue;
        const [sh, sm] = s.startTime.split(":").map(Number);
        const [eh, em] = s.endTime.split(":").map(Number);
        min = Math.min(min, sh + sm / 60);
        max = Math.max(max, eh + em / 60);
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { startHour: START_HOUR, endHour: END_HOUR };
    }
    return { startHour: Math.floor(min), endHour: Math.ceil(max) };
  }, [profissionais, schedulesByEmployee, dayOfWeek]);

  const totalSlots = ((gridEndHour - gridStartHour) * 60) / slotSize;

  const [nowTopPx, setNowTopPx] = useState<number | null>(null);

  useEffect(() => {
    const calcNow = () => {
      if (!isSameDay(selectedDate, new Date())) {
        setNowTopPx(null);
        return;
      }
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= gridStartHour * 60 && nowMin <= gridEndHour * 60) {
        setNowTopPx(((nowMin - gridStartHour * 60) / slotSize) * SLOT_HEIGHT_PX);
      } else setNowTopPx(null);
    };
    calcNow();
    const iv = setInterval(calcNow, 60_000);
    return () => clearInterval(iv);
  }, [slotSize, SLOT_HEIGHT_PX, selectedDate, gridStartHour, gridEndHour]);

  // Ao abrir a agenda (ou trocar de dia), rola até a posição da linha do
  // tempo atual (ver spec-revisao-cliente-1.md §5.4) — uma vez por dia
  // selecionado, não a cada recálculo de `nowTopPx` (a cada minuto).
  const kanbanScrollRef = useRef<HTMLDivElement | null>(null);
  const scrolledToNowForDate = useRef<string | null>(null);
  useEffect(() => {
    if (nowTopPx === null || viewMode !== "kanban") return;
    const dateKey = toDateInputValue(selectedDate);
    if (scrolledToNowForDate.current === dateKey) return;
    const el = kanbanScrollRef.current;
    if (!el) return;
    scrolledToNowForDate.current = dateKey;
    const headerHeight = 92;
    el.scrollTop = Math.max(0, headerHeight + nowTopPx - el.clientHeight / 2);
  }, [nowTopPx, viewMode, selectedDate]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const profById = useMemo(() => {
    const m = new Map(profissionais.map((p) => [p.id, p]));
    return m;
  }, [profissionais]);

  const profissionaisVisiveis = useMemo(
    () =>
      profissionais.filter(
        (p) => filtroProf === "todos" || p.id === filtroProf,
      ),
    [profissionais, filtroProf],
  );

  // Agendamentos "sem preferência" (employeeId null) não pertencem a nenhum
  // profissional cadastrado — ganham uma pseudo-coluna própria na grade
  // (somente leitura: não aceita drop nem criação de bloqueio, ver
  // `ProfissionalColuna`) pra não sumirem da agenda.
  const colunasVisiveis = useMemo<ProfissionalVM[]>(() => {
    if (filtroProf === SEM_PREFERENCIA_ID) return [PROFISSIONAL_SEM_PREFERENCIA];
    if (filtroProf === "todos")
      return [...profissionaisVisiveis, PROFISSIONAL_SEM_PREFERENCIA];
    return profissionaisVisiveis;
  }, [profissionaisVisiveis, filtroProf]);

  const agPorProfissional = useMemo(() => {
    const map: Record<string, AgendamentoVM[]> = {};
    profissionais.forEach((p) => (map[p.id] = []));
    map[SEM_PREFERENCIA_ID] = [];
    agendamentos.forEach((ag) => {
      // Cancelados (e faltas) aparecem apenas na visualização em lista.
      if (ag.status === "CANCELLED" || ag.status === "NO_SHOW") return;
      if (map[ag.profissionalId]) map[ag.profissionalId].push(ag);
    });
    return map;
  }, [agendamentos, profissionais]);

  // ─── Filtros de comandas ────────────────────────────────────────────────────
  const comandasAbertas = useMemo(
    () => comandas.filter((c) => c.status === "ABERTA"),
    [comandas],
  );
  const comandasFechadas = useMemo(
    () => comandas.filter((c) => c.status === "FECHADA"),
    [comandas],
  );
  const comandasAntigas = useMemo(() => {
    const umDiaAtras = Date.now() - 24 * 60 * 60 * 1000;
    return comandasAbertas.filter(
      (c) => new Date(c.createdAt).getTime() < umDiaAtras,
    );
  }, [comandasAbertas]);

  const comandasFiltradas: Comanda[] = useMemo(() => {
    switch (filtroComanda) {
      case "abertas":
        return comandasAbertas;
      case "fechadas":
        return comandasFechadas;
      case "antigas":
        return comandasAntigas;
      default:
        return [];
    }
  }, [filtroComanda, comandasAbertas, comandasFechadas, comandasAntigas]);

  // ─── Visão de mês ───────────────────────────────────────────────────────────
  const monthDates = useMemo(() => buildMonthDates(selectedDate), [selectedDate]);

  const agendamentosMes = useMemo(() => {
    const idsVisiveis = new Set(colunasVisiveis.map((p) => p.id));
    return agendamentosTodos.filter((a) => idsVisiveis.has(a.profissionalId));
  }, [agendamentosTodos, colunasVisiveis]);

  const agendamentoAtivo = useMemo(
    () => agendamentos.find((a) => a.id === activeId) ?? null,
    [activeId, agendamentos],
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over, delta } = e;
      if (!over) return;
      const ag = agendamentos.find((a) => a.id === active.id);
      if (!ag) return;

      const overData = over.data?.current as
        | { profissionalId?: string }
        | undefined;
      const newProfId = overData?.profissionalId ?? ag.profissionalId;
      const deltaSlotsY = Math.round(delta.y / SLOT_HEIGHT_PX);
      let newInicio = snapToSlot(ag.inicioMin + deltaSlotsY * slotSize, slotSize);
      newInicio = Math.max(
        gridStartHour * 60,
        Math.min(gridEndHour * 60 - ag.duracao, newInicio),
      );

      const conflicts = findConflicts(
        agendamentos,
        newProfId,
        newInicio,
        ag.duracao,
        ag.id,
        bloqueios,
      );
      const bloqueioConflitos = conflicts.filter(isBloqueio);
      const agConflitos = conflicts.filter(
        (c): c is AgendamentoVM => !isBloqueio(c),
      );

      if (bloqueioConflitos.length > 0) {
        toast.error("Horário bloqueado! Não é possível agendar neste período.");
        return;
      }

      if (agConflitos.length > 0) {
        setDadosConflito({
          agMovendo: ag,
          conflitantes: agConflitos,
          novoInicio: newInicio,
          novoProfId: newProfId,
          duracaoMovendo: ag.duracao,
        });
        setConflitoPendente({
          agId: ag.id,
          novoProfId: newProfId,
          novoInicio: newInicio,
        });
        setDialogConflito(true);
        return;
      }

      // Move visualmente de imediato (otimista) e persiste no backend em
      // seguida. Em caso de falha (ex.: conflito detectado pelo servidor),
      // `rescheduleAgendamento` limpa o overlay e o card volta pro lugar.
      moveLocal(ag.id, { inicioMin: newInicio, profissionalId: newProfId });
      void rescheduleAgendamento(ag.id, newInicio, newProfId).then((ok) => {
        if (ok) toast.success("Agendamento reagendado.");
      });
    },
    [agendamentos, slotSize, SLOT_HEIGHT_PX, bloqueios, moveLocal, rescheduleAgendamento],
  );

  const confirmarConflito = useCallback(() => {
    if (!conflitoPendente) return;
    const { agId, novoProfId, novoInicio } = conflitoPendente;
    moveLocal(agId, { inicioMin: novoInicio, profissionalId: novoProfId });
    setConflitoPendente(null);
    toast.warning("Agendamento sobreposto (apenas visual).");
  }, [conflitoPendente, moveLocal]);

  const handleNovoAgendamento = useCallback(
    async (dados: NovoAgendamentoInput) => {
      setSubmittingNovo(true);
      try {
        const created = await createAgendamento(dados);
        if (created) {
          // Navega o kanban pro dia do agendamento criado — garante que o
          // card apareça imediatamente mesmo se o usuário escolheu outro dia.
          setSelectedDate(dados.data);
          setDialogNovo(false);
        }
      } finally {
        setSubmittingNovo(false);
      }
    },
    [createAgendamento],
  );

  const handleDelete = useCallback(
    (id: string) => {
      void cancel(id);
    },
    [cancel],
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: UpdatableAppointmentStatus) => {
      void updateStatus(id, status);
      setDialogDetalhe(false);
    },
    [updateStatus],
  );

  const handleCardClick = useCallback((ag: AgendamentoVM) => {
    setAgSelecionado(ag);
    setDialogDetalhe(true);
  }, []);

  /** Comanda ainda aberta já vinculada ao agendamento selecionado, se houver. */
  const comandaAbertaDoAgendamento = useMemo(() => {
    if (!agSelecionado) return null;
    return (
      comandas.find(
        (c) =>
          c.status === "ABERTA" &&
          c.agendamentos.some((a) => a.appointmentId === agSelecionado.id),
      ) ?? null
    );
  }, [comandas, agSelecionado]);

  /**
   * Abre o modal de composição de comanda a partir do agendamento selecionado
   * no detalhe (item 1.5 da spec) — a comanda já vem atrelada a este
   * agendamento (com o serviço pré-adicionado); o usuário completa com mais
   * produtos/serviços antes de salvar.
   */
  const handleAbrirComanda = useCallback((ag: AgendamentoVM) => {
    setAgSelecionadoComanda(ag);
    setDialogComandaAgendamento(true);
    setDialogDetalhe(false);
  }, []);

  const handleFecharComandaAgendamento = useCallback(
    async (draft: Parameters<typeof createComanda>[0]) => {
      const created = await createComanda(draft);
      // A comanda é criada aqui, mas o fechamento (com escolha do caixa, se
      // a filial tiver mais de um aberto) acontece no DialogFecharComanda.
      if (created) setFecharComandaTarget(created);
      return created;
    },
    [createComanda],
  );

  const handleResizeEnd = useCallback(
    (id: string, novaDuracao: number) => {
      const ag = agendamentos.find((a) => a.id === id);
      if (!ag) return;
      const conflicts = findConflicts(
        agendamentos,
        ag.profissionalId,
        ag.inicioMin,
        novaDuracao,
        id,
        bloqueios,
      );
      if (conflicts.some((c) => !isBloqueio(c))) {
        toast.error(
          "Não foi possível redimensionar: conflito com outro agendamento.",
        );
        return;
      }
      resizeLocal(id, novaDuracao);
      void resizeAgendamento(id, novaDuracao).then((ok) => {
        if (ok) toast.success("Duração ajustada.");
      });
    },
    [agendamentos, bloqueios, resizeLocal, resizeAgendamento],
  );

  const handleSlotClick = useCallback((profId: string, inicioMin: number) => {
    setPrefilledHora(minToTime(inicioMin));
    // "sem-prof" é só o id da pseudo-coluna — não existe Employee com esse
    // id, então não pode ir pro form (o select simplesmente fica sem
    // preferência selecionada, que é o resultado desejado).
    setPrefilledProfId(profId === SEM_PREFERENCIA_ID ? undefined : profId);
    setDialogNovo(true);
  }, []);

  const handleCriarBloqueio = useCallback(
    (profissionalId: string, inicioMin: number, duracaoMin: number) => {
      if (!filialId) {
        toast.error("Selecione a filial antes de bloquear um horário.");
        return;
      }
      const start = new Date(selectedDate);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCMinutes(inicioMin);
      const end = new Date(start.getTime() + duracaoMin * 60_000);
      void createScheduleBlock({
        branchId: filialId,
        employeeId: profissionalId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        reason: "Bloqueado",
      });
    },
    [filialId, selectedDate, createScheduleBlock],
  );

  const handleSalvarBloqueioModal = useCallback(
    (input: NovoBloqueioInput) => {
      const start = new Date(input.data);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCMinutes(input.inicioMin);
      const end = new Date(start.getTime() + input.duracaoMin * 60_000);
      void createScheduleBlock({
        branchId: input.branchId,
        employeeId: input.profissionalId === "todos" ? null : input.profissionalId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        reason: input.motivo || "Bloqueado",
      });
    },
    [createScheduleBlock],
  );

  const handleDeleteBloqueio = useCallback(
    (id: string) => {
      void removeScheduleBlock(id);
    },
    [removeScheduleBlock],
  );

  /** Arrastar um bloqueio (mudar início, mantendo a duração) — ver §5.5. */
  const handleMoveBloqueio = useCallback(
    (id: string, novoInicioMin: number) => {
      const bloqueio = bloqueios.find((b) => b.id === id);
      if (!bloqueio) return;
      const start = new Date(selectedDate);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCMinutes(novoInicioMin);
      const end = new Date(start.getTime() + bloqueio.duracaoMin * 60_000);
      void updateScheduleBlock(id, {
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      });
    },
    [bloqueios, selectedDate, updateScheduleBlock],
  );

  /** Redimensionar um bloqueio (mudar duração, mantendo o início) — ver §5.5. */
  const handleResizeBloqueio = useCallback(
    (id: string, novaDuracaoMin: number) => {
      const bloqueio = bloqueios.find((b) => b.id === id);
      if (!bloqueio) return;
      const start = new Date(selectedDate);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCMinutes(bloqueio.inicioMin);
      const end = new Date(start.getTime() + novaDuracaoMin * 60_000);
      void updateScheduleBlock(id, {
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      });
    },
    [bloqueios, selectedDate, updateScheduleBlock],
  );

  const filialAtual = branches.find((f) => f.id === filialId);
  const dataFormatada = format(selectedDate, "EEEE, dd MMM yyyy", {
    locale: ptBR,
  });

  // Feriado (ou horário especial) cadastrado pra filial + dia selecionados.
  const selectedDateIso = format(selectedDate, "yyyy-MM-dd");
  const holidayHoje = holidays.find(
    (h) =>
      h.date === selectedDateIso &&
      (h.branchId === filialId || h.branchId === null),
  );
  const dataCapitalizada =
    dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

  // Fora do expediente/intervalo/feriado/folga de cada profissional visível,
  // pro dia selecionado — somente leitura (ver `IndisponibilidadeCard`).
  const indisponibilidades = useMemo<Indisponibilidade[]>(
    () =>
      profissionais.flatMap((p) =>
        buildIndisponibilidades({
          profissionalId: p.id,
          selectedDate,
          schedules: schedulesByEmployee.get(p.id) ?? [],
          breaks: breaksByEmployee.get(p.id) ?? [],
          timeOff: timeOffByEmployee.get(p.id) ?? [],
          holidayHoje,
          startHour: gridStartHour,
          endHour: gridEndHour,
        }),
      ),
    [
      profissionais,
      selectedDate,
      schedulesByEmployee,
      breaksByEmployee,
      timeOffByEmployee,
      holidayHoje,
      gridStartHour,
      gridEndHour,
    ],
  );

  const shiftDate = (days: number) =>
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + days);
      return next;
    });

  const shiftMonth = (units: number) =>
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(1); // evita overflow de dia (ex.: 31 jan + 1 mês)
      next.setMonth(next.getMonth() + units);
      return next;
    });

  const isMonthMode = viewMode === "mes";
  const monthLabel = selectedDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const monthLabelCapitalizada =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const agSelecionadoServico = agSelecionado
    ? (servicoById.get(agSelecionado.servicoId) ?? null)
    : null;
  const agSelecionadoProf = agSelecionado
    ? (profById.get(agSelecionado.profissionalId) ?? null)
    : null;

  return (
    <>
      <style>{`
        .schedule-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .schedule-scroll::-webkit-scrollbar-track { background: #0d1117; }
        .schedule-scroll::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        .schedule-scroll::-webkit-scrollbar-thumb:hover { background: #484f58; }
        .schedule-scroll { scrollbar-width: thin; scrollbar-color: #30363d #0d1117; }
      `}</style>

      <div
        className={cn(
          "flex flex-col bg-surface-base text-foreground overflow-x-hidden",
          viewMode !== "kanban" && "md:flex-1 md:min-h-0 md:overflow-hidden",
        )}
      >
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Agendamentos
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isMonthMode ? monthLabelCapitalizada : dataCapitalizada}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filial */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors cursor-pointer">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  <span className="max-w-[120px] truncate text-sm">
                    {filialAtual?.name ?? "Filial"}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                {branches.length === 0 && (
                  <DropdownMenuItem
                    disabled
                    className="text-xs text-text-faint"
                  >
                    Nenhuma filial
                  </DropdownMenuItem>
                )}
                {branches.map((f) => (
                  <DropdownMenuItem
                    key={f.id}
                    onClick={() => setFilialId(f.id)}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      filialId === f.id && "text-brand",
                    )}
                  >
                    <Building2 className="size-3 mr-2" />
                    {f.name}
                    <span className="text-text-faint ml-1">· {f.city}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Navegação de data: setas + Hoje + escolher qualquer data */}
            <div className="flex items-center bg-surface-raised border border-border rounded-md h-9 overflow-hidden divide-x divide-border">
              <button
                type="button"
                onClick={() => (isMonthMode ? shiftMonth(-1) : shiftDate(-1))}
                className="h-9 px-2.5 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                title="Ir para hoje"
                className={cn(
                  "h-9 px-3 text-sm font-medium transition-colors min-w-[64px] whitespace-nowrap",
                  isToday(selectedDate)
                    ? "text-brand"
                    : "text-foreground hover:bg-surface-elevated",
                )}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => (isMonthMode ? shiftMonth(1) : shiftDate(1))}
                className="h-9 px-2.5 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            {isMonthMode ? (
              <div className="w-40 h-10 px-3 rounded-md border border-border bg-surface-base flex items-center justify-center">
                <span className="text-sm font-medium text-foreground truncate">
                  {monthLabelCapitalizada}
                </span>
              </div>
            ) : (
              <div className="w-40">
                <DatePickerField
                  id="agenda-data"
                  date={selectedDate}
                  onChange={(d) => d && setSelectedDate(d)}
                />
              </div>
            )}

            {/* View toggle */}
            <div className="flex items-center bg-surface-raised border border-border rounded-md h-9 overflow-hidden divide-x divide-border">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "h-9 px-3 flex items-center gap-1.5 text-xs transition-colors",
                  viewMode === "kanban"
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
                )}
              >
                <LayoutGrid className="size-3.5" />
                Agenda
              </button>
              <button
                type="button"
                onClick={() => setViewMode("lista")}
                className={cn(
                  "h-9 px-3 flex items-center gap-1.5 text-xs transition-colors",
                  viewMode === "lista"
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
                )}
              >
                <LayoutList className="size-3.5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mes")}
                className={cn(
                  "h-9 px-3 flex items-center gap-1.5 text-xs transition-colors",
                  viewMode === "mes"
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
                )}
              >
                <CalendarRange className="size-3.5" />
                Mês
              </button>
            </div>

            {/* Filtro profissional */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors cursor-pointer">
                  <User className="size-3.5 text-muted-foreground" />
                  <span className="max-w-[90px] truncate text-xs">
                    {filtroProf === "todos"
                      ? "Todos"
                      : filtroProf === SEM_PREFERENCIA_ID
                        ? PROFISSIONAL_SEM_PREFERENCIA.nome
                        : profById.get(filtroProf)?.nome}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                <DropdownMenuItem
                  onClick={() => setFiltroProf("todos")}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    filtroProf === "todos" && "text-brand",
                  )}
                >
                  Todos os profissionais
                </DropdownMenuItem>
                {profissionais.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setFiltroProf(p.id)}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      filtroProf === p.id && "text-brand",
                    )}
                  >
                    {p.avatar} {p.nome}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => setFiltroProf(SEM_PREFERENCIA_ID)}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    filtroProf === SEM_PREFERENCIA_ID && "text-brand",
                  )}
                >
                  {PROFISSIONAL_SEM_PREFERENCIA.avatar} {PROFISSIONAL_SEM_PREFERENCIA.nome}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro de comandas */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton
                  className={cn(
                    "h-9 px-3 rounded-md border text-sm flex items-center gap-2 transition-colors cursor-pointer",
                    filtroComanda !== "nenhum"
                      ? "border-brand/40 bg-brand/5 text-brand"
                      : "border-border bg-surface-raised text-foreground hover:border-brand/40",
                  )}
                >
                  <ClipboardList className="size-3.5 text-muted-foreground" />
                  <span className="max-w-[110px] truncate text-xs">
                    {filtroComanda === "abertas"
                      ? `Comandas abertas (${comandasAbertas.length})`
                      : filtroComanda === "fechadas"
                        ? `Comandas fechadas (${comandasFechadas.length})`
                        : filtroComanda === "antigas"
                          ? `+1 dia (${comandasAntigas.length})`
                          : "Comandas"}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                <DropdownMenuItem
                  onClick={() => setFiltroComanda("nenhum")}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    filtroComanda === "nenhum" && "text-brand",
                  )}
                >
                  Sem filtro
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFiltroComanda("abertas")}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    filtroComanda === "abertas" && "text-brand",
                  )}
                >
                  Comandas abertas ({comandasAbertas.length})
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFiltroComanda("fechadas")}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    filtroComanda === "fechadas" && "text-brand",
                  )}
                >
                  Comandas fechadas ({comandasFechadas.length})
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFiltroComanda("antigas")}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    filtroComanda === "antigas" && "text-brand",
                  )}
                >
                  Abertas há mais de 1 dia ({comandasAntigas.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Slot size */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors cursor-pointer">
                  <Settings2 className="size-3.5 text-muted-foreground" />
                  {slotSize}min
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                {SLOT_OPTIONS.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => setSlotSize(s)}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      slotSize === s && "text-brand",
                    )}
                  >
                    {s} minutos {slotSize === s && "✓"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bloquear horário */}
            <button
              type="button"
              onClick={() => {
                setModoBloquear((v) => !v);
                if (!modoBloquear)
                  toast("Modo bloqueio ativado. Clique e arraste no grid.");
              }}
              className={cn(
                "h-9 px-3 rounded-md border text-sm font-semibold flex items-center gap-1.5 transition-colors",
                modoBloquear
                  ? "border-red-500/60 bg-red-500/15 text-red-400"
                  : "border-border bg-surface-raised text-muted-foreground hover:text-foreground hover:border-red-500/40",
              )}
            >
              <Ban className="size-3.5" />
              {modoBloquear ? "Bloqueando..." : "Bloquear"}
            </button>

            {/* Novo bloqueio (formulário com aviso de conflito) */}
            <button
              type="button"
              onClick={() => setDialogBloqueio(true)}
              className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:border-red-500/40 transition-colors flex items-center gap-1.5"
            >
              <Ban className="size-3.5 text-muted-foreground" />
              Novo bloqueio
            </button>

            {/* Nova comanda */}
            <button
              type="button"
              onClick={() => setDialogComanda(true)}
              className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:border-brand/40 transition-colors flex items-center gap-1.5"
            >
              <Receipt className="size-3.5 text-muted-foreground" />
              Comanda de consumo
            </button>

            {/* Novo agendamento */}
            <button
              type="button"
              onClick={() => {
                if (holidayHoje?.status === "CLOSED") {
                  toast.error(
                    `Fechado neste dia (feriado: ${holidayHoje.name}).`,
                  );
                  return;
                }
                setPrefilledHora(undefined);
                setPrefilledProfId(undefined);
                setDialogNovo(true);
              }}
              className={cn(
                "h-9 px-4 rounded-md text-sm font-bold transition-all flex items-center gap-1.5",
                holidayHoje?.status === "CLOSED"
                  ? "bg-surface-elevated text-muted-foreground cursor-not-allowed"
                  : "bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.3)]",
              )}
            >
              <Plus className="size-3.5" />
              Novo agendamento
            </button>
          </div>
        </div>

        {/* ── Aviso de feriado / horário especial ── */}
        {holidayHoje && (
          <div
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2.5 text-sm font-medium border-b border-border-subtle shrink-0",
              holidayHoje.status === "CLOSED"
                ? "bg-red-500/10 text-red-400"
                : "bg-amber-500/10 text-amber-400",
            )}
          >
            <CalendarOff className="size-4 shrink-0" />
            {holidayHoje.status === "CLOSED" ? (
              <span>Fechado — Feriado: {holidayHoje.name}</span>
            ) : (
              <span>
                Horário especial — {holidayHoje.name}: {holidayHoje.startTime}
                –{holidayHoje.endTime}
              </span>
            )}
          </div>
        )}

        {/* ── Painel de comandas filtradas ── */}
        {filtroComanda !== "nenhum" && (
          <div className="flex items-center gap-2 px-4 md:px-6 py-2 border-b border-border-subtle shrink-0 overflow-x-auto schedule-scroll">
            {comandasFiltradas.length === 0 ? (
              <span className="text-xs text-text-faint">
                Nenhuma comanda encontrada para este filtro.
              </span>
            ) : (
              comandasFiltradas.map((c) => (
                <Link
                  key={c.id}
                  href="/orders"
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border-subtle bg-surface-raised hover:border-brand/40 transition-colors text-[11px] text-muted-foreground"
                >
                  <Receipt className="size-3 text-emerald-400" />#{c.numero} ·{" "}
                  {c.clienteAvulso ??
                    c.agendamentos[0]?.clienteNome ??
                    "Cliente"}
                  <ExternalLink className="size-3 text-text-faint" />
                </Link>
              ))
            )}
          </div>
        )}

        {/* ── Resumo do Dia ── */}
        {!isMonthMode && (
          <ResumoDia
            agendamentos={agendamentos}
            comandasAbertas={comandasAbertas.length}
          />
        )}

        {/* ── Legendas (ícones + cores) ── */}
        {viewMode === "kanban" && (
          <>
            <IconLegend />
            <ColorLegend />
          </>
        )}

        {/* ── Conteúdo ── */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loading label="Carregando agenda" />
          </div>
        ) : profissionais.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-faint gap-2 px-6 text-center">
            <User className="size-8 opacity-40" />
            <p className="text-sm">
              Nenhum profissional cadastrado nesta filial. Cadastre profissionais
              em Configurações para montar a agenda.
            </p>
          </div>
        ) : viewMode === "mes" ? (
          <div className="md:flex-1 md:overflow-y-auto schedule-scroll">
            <AgendaMonthGrid
              dates={monthDates}
              agendamentos={agendamentosMes}
              currentMonth={selectedDate.getMonth()}
              onSelect={handleCardClick}
              onDayClick={(d) => {
                setSelectedDate(d);
                setViewMode("kanban");
              }}
            />
          </div>
        ) : viewMode === "kanban" ? (
          <div
            ref={kanbanScrollRef}
            className="overflow-x-auto schedule-scroll shrink-0"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex min-h-full">
                <TimeLine
                  slotSize={slotSize}
                  slotHeightPx={SLOT_HEIGHT_PX}
                  totalSlots={totalSlots}
                  startHour={gridStartHour}
                />
                <div className="w-px bg-surface-elevated shrink-0" />
                <div className="flex flex-1 divide-x divide-border-subtle">
                  {colunasVisiveis.map((prof) => (
                    <div
                      key={prof.id}
                      className="relative flex flex-col flex-1 min-w-[140px]"
                    >
                      {nowTopPx !== null && (
                        <div
                          className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                          style={{ top: 92 + nowTopPx }}
                        >
                          <div className="size-2 rounded-full bg-red-500 shrink-0 -ml-1" />
                          <div className="flex-1 h-px bg-red-500/50" />
                        </div>
                      )}
                      <ProfissionalColuna
                        profissional={prof}
                        agendamentos={agPorProfissional[prof.id] ?? []}
                        servicoById={servicoById}
                        slotSize={slotSize}
                        slotHeightPx={SLOT_HEIGHT_PX}
                        totalSlots={totalSlots}
                        activeId={activeId}
                        onCardClick={handleCardClick}
                        onResizeEnd={handleResizeEnd}
                        bloqueios={bloqueios}
                        onDeleteBloqueio={handleDeleteBloqueio}
                        onMoveBloqueio={handleMoveBloqueio}
                        onResizeBloqueio={handleResizeBloqueio}
                        onCriarBloqueio={handleCriarBloqueio}
                        modoBloquear={modoBloquear}
                        onSlotClick={handleSlotClick}
                        indisponibilidades={indisponibilidades}
                        startHour={gridStartHour}
                        disabled={prof.id === SEM_PREFERENCIA_ID}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <DragOverlay>
                {agendamentoAtivo &&
                  servicoById.get(agendamentoAtivo.servicoId) && (
                    <div
                      className="opacity-90 pointer-events-none"
                      style={{ width: 178 }}
                    >
                      <AgendamentoCard
                        agendamento={agendamentoAtivo}
                        servico={servicoById.get(agendamentoAtivo.servicoId)!}
                        slotSize={slotSize}
                        slotHeightPx={SLOT_HEIGHT_PX}
                      />
                    </div>
                  )}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          <div className="md:flex-1 md:overflow-hidden">
            <ModoLista
              agendamentos={agendamentos}
              servicos={servicos}
              profissionais={profissionais}
              servicoById={servicoById}
              profById={profById}
              onCardClick={handleCardClick}
            />
          </div>
        )}

        {/* ── Dialogs ── */}
        <DialogNovoAgendamento
          open={dialogNovo}
          onOpenChange={setDialogNovo}
          onConfirm={(d) => void handleNovoAgendamento(d)}
          onCreateClient={createClient}
          servicos={servicos}
          profissionaisTodos={profissionaisTodos}
          branches={branches}
          defaultBranchId={filialId || undefined}
          agendamentos={agendamentos}
          bloqueios={bloqueios}
          clients={clients}
          defaultDate={selectedDate}
          prefilledHora={prefilledHora}
          prefilledProfId={prefilledProfId}
          submitting={submittingNovo}
        />
        <DialogDetalhe
          open={dialogDetalhe}
          onOpenChange={setDialogDetalhe}
          agendamento={agSelecionado}
          servico={agSelecionadoServico}
          profissional={agSelecionadoProf}
          servicos={servicos}
          profissionaisTodos={profissionaisTodos}
          branches={branches}
          clients={clients}
          clientActivePlans={clientActivePlans}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
          onSave={updateAgendamento}
          onTransferClient={transferAgendamento}
          onCreateClient={createClient}
          onAbrirComanda={handleAbrirComanda}
          comandaAberta={comandaAbertaDoAgendamento}
        />
        <DialogConflito
          open={dialogConflito}
          onOpenChange={setDialogConflito}
          dados={dadosConflito}
          servicoById={servicoById}
          onConfirm={confirmarConflito}
        />
        <DialogNovaComanda
          open={dialogComanda}
          onOpenChange={setDialogComanda}
          barbershopId={barbershop?.id}
          clients={clients}
          branches={branches}
          profissionais={profissionaisTodos}
          onCreate={createComanda}
        />
        <DialogComandaAgendamento
          key={agSelecionadoComanda?.id ?? "none"}
          open={dialogComandaAgendamento}
          onOpenChange={setDialogComandaAgendamento}
          barbershopId={barbershop?.id}
          agendamento={agSelecionadoComanda}
          onSave={createComanda}
          onFechar={handleFecharComandaAgendamento}
        />
        <DialogFecharComanda
          open={fecharComandaTarget !== null}
          onOpenChange={(v) => !v && setFecharComandaTarget(null)}
          barbershopId={barbershop?.id}
          comanda={fecharComandaTarget}
          onConfirm={async ({ itens, pagamentos }) => {
            if (!fecharComandaTarget) return;
            await updateComanda(fecharComandaTarget.id, {
              ...comandaToDraft(fecharComandaTarget),
              itens,
            });
            return setComandaStatus(fecharComandaTarget.id, "FECHADA", pagamentos);
          }}
        />
        <DialogNovoBloqueio
          open={dialogBloqueio}
          onOpenChange={setDialogBloqueio}
          branches={branches}
          profissionais={profissionaisTodos}
          agendamentos={agendamentosTodos}
          selectedDate={selectedDate}
          defaultFilialId={filialId}
          onSave={handleSalvarBloqueioModal}
        />
      </div>
    </>
  );
}
