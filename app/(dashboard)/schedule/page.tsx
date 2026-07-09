"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  AgendamentoCard,
  ProfissionalColuna,
  TimeLine,
  ModoLista,
  ResumoDia,
  IconLegend,
  ColorLegend,
  DialogNovoAgendamento,
  DialogDetalhe,
  DialogConflito,
  DialogNovaComanda,
  DropdownButton,
  findConflicts,
  isBloqueio,
  minToTime,
  snapToSlot,
  gerarId,
  SLOT_OPTIONS,
  START_HOUR,
  END_HOUR,
} from "@/components/schedule";
import type {
  AgendamentoVM,
  BloqueioHorario,
  ConflitoDados,
  NovoAgendamentoInput,
  SlotSize,
  ViewMode,
} from "@/components/schedule";
import type { UpdatableAppointmentStatus } from "@/types/appointment.types";
import { Loading, DatePickerField } from "@/components/shared";

export default function SchedulePage() {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { holidays } = useHolidays(barbershop?.id);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [filialId, setFilialId] = useState<string>("");

  // Define a primeira filial assim que carregarem
  useEffect(() => {
    if (!filialId && branches.length > 0) setFilialId(branches[0].id);
  }, [branches, filialId]);

  const {
    servicos,
    profissionais,
    agendamentos,
    clients,
    servicoById,
    isLoading,
    createAgendamento,
    createClient,
    updateStatus,
    cancel,
    moveLocal,
    resizeLocal,
  } = useSchedule(barbershop?.id, selectedDate, filialId || undefined);

  // UI state
  const [bloqueios, setBloqueios] = useState<BloqueioHorario[]>([]);
  const [slotSize, setSlotSize] = useState<SlotSize>(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filtroProf, setFiltroProf] = useState<string>("todos");
  const [modoBloquear, setModoBloquear] = useState(false);

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

  const [prefilledHora, setPrefilledHora] = useState<string | undefined>();
  const [prefilledProfId, setPrefilledProfId] = useState<string | undefined>();

  const SLOT_HEIGHT_PX = slotSize === 10 ? 28 : slotSize === 20 ? 40 : 56;
  const totalSlots = ((END_HOUR - START_HOUR) * 60) / slotSize;

  const [nowTopPx, setNowTopPx] = useState<number | null>(null);

  useEffect(() => {
    const calcNow = () => {
      if (!isSameDay(selectedDate, new Date())) {
        setNowTopPx(null);
        return;
      }
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60) {
        setNowTopPx(((nowMin - START_HOUR * 60) / slotSize) * SLOT_HEIGHT_PX);
      } else setNowTopPx(null);
    };
    calcNow();
    const iv = setInterval(calcNow, 60_000);
    return () => clearInterval(iv);
  }, [slotSize, SLOT_HEIGHT_PX, selectedDate]);

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

  const agPorProfissional = useMemo(() => {
    const map: Record<string, AgendamentoVM[]> = {};
    profissionais.forEach((p) => (map[p.id] = []));
    agendamentos.forEach((ag) => {
      // Cancelados (e faltas) aparecem apenas na visualização em lista.
      if (ag.status === "CANCELLED") return;
      if (map[ag.profissionalId]) map[ag.profissionalId].push(ag);
    });
    return map;
  }, [agendamentos, profissionais]);

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
        START_HOUR * 60,
        Math.min(END_HOUR * 60 - ag.duracao, newInicio),
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

      // TODO backend: PATCH /appointments/:id (scheduledAt/employeeId).
      // Sem endpoint, a movimentação é apenas visual (não persiste).
      moveLocal(ag.id, { inicioMin: newInicio, profissionalId: newProfId });
    },
    [agendamentos, slotSize, SLOT_HEIGHT_PX, bloqueios, moveLocal],
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
      toast.success("Duração ajustada (apenas visual).");
    },
    [agendamentos, bloqueios, resizeLocal],
  );

  const handleSlotClick = useCallback((profId: string, inicioMin: number) => {
    setPrefilledHora(minToTime(inicioMin));
    setPrefilledProfId(profId);
    setDialogNovo(true);
  }, []);

  const handleCriarBloqueio = useCallback(
    (profissionalId: string, inicioMin: number, duracaoMin: number) => {
      setBloqueios((prev) => [
        ...prev,
        {
          id: gerarId(),
          profissionalId,
          inicioMin,
          duracaoMin,
          motivo: "Bloqueado",
          tipo: "bloqueio",
        },
      ]);
      toast.success("Horário bloqueado.");
    },
    [],
  );

  const handleDeleteBloqueio = useCallback((id: string) => {
    setBloqueios((prev) => prev.filter((b) => b.id !== id));
    toast.success("Bloqueio removido.");
  }, []);

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

  const shiftDate = (days: number) =>
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + days);
      return next;
    });

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

      <div className="flex flex-col bg-surface-base text-foreground overflow-x-hidden md:flex-1 md:min-h-0 md:overflow-hidden">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Agendamentos
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{dataCapitalizada}</p>
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
                onClick={() => shiftDate(-1)}
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
                onClick={() => shiftDate(1)}
                className="h-9 px-2.5 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="w-40">
              <DatePickerField
                id="agenda-data"
                date={selectedDate}
                onChange={(d) => d && setSelectedDate(d)}
              />
            </div>

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
            </div>

            {/* Filtro profissional */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors cursor-pointer">
                  <User className="size-3.5 text-muted-foreground" />
                  <span className="max-w-[90px] truncate text-xs">
                    {filtroProf === "todos"
                      ? "Todos"
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

        {/* ── Resumo do Dia ── */}
        <ResumoDia agendamentos={agendamentos} />

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
        ) : viewMode === "kanban" ? (
          <div className="overflow-x-auto schedule-scroll md:flex-1 md:overflow-y-auto md:overflow-x-hidden">
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
                />
                <div className="w-px bg-surface-elevated shrink-0" />
                <div className="flex flex-1 divide-x divide-border-subtle">
                  {profissionaisVisiveis.map((prof) => (
                    <div
                      key={prof.id}
                      className="relative flex flex-col flex-1 min-w-0"
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
                        onCriarBloqueio={handleCriarBloqueio}
                        modoBloquear={modoBloquear}
                        onSlotClick={handleSlotClick}
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
          profissionais={profissionais}
          agendamentos={agendamentos}
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
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
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
        />
      </div>
    </>
  );
}
