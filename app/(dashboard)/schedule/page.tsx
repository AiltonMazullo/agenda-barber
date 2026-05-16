"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Scissors,
  User,
  LayoutList,
  LayoutGrid,
  Building2,
  Ban,
  Receipt,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  AGENDAMENTOS_MOCK,
  FILIAIS,
  PROFISSIONAIS,
  SERVICOS,
  type Agendamento,
} from "@/mock/schedule";
import {
  END_HOUR,
  SLOT_OPTIONS,
  START_HOUR,
  type BloqueioHorario,
  type ScheduleViewMode,
  type SlotSize,
} from "@/types/schedule.types";
import {
  calcNowTopPx,
  findConflicts,
  gerarAgendamentoId,
  getDuracao,
  minToTime,
  snapToSlot,
  type AgendamentoComCustom,
} from "@/utils/schedule.utils";

import {
  AgendamentoCard,
  DialogConflito,
  DialogDetalhe,
  DialogMudancaDuracao,
  DialogNovaComanda,
  DialogNovoAgendamento,
  DropdownButton,
  ModoLista,
  ProfissionalColuna,
  ResumoDia,
  TimeLine,
  type DadosConflito,
  type DadosMudancaDuracao,
} from "@/components/schedule";

export default function SchedulePage() {
  const [agendamentos, setAgendamentos] =
    useState<Agendamento[]>(AGENDAMENTOS_MOCK);
  const [bloqueios, setBloqueios] = useState<BloqueioHorario[]>([]);
  const [slotSize, setSlotSize] = useState<SlotSize>(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("kanban");
  const [filtroProf, setFiltroProf] = useState<string>("todos");
  const [filialId, setFilialId] = useState<string>(FILIAIS[0].id);
  const [modoBloquear, setModoBloquear] = useState(false);

  const [dialogNovo, setDialogNovo] = useState(false);
  const [dialogDetalhe, setDialogDetalhe] = useState(false);
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null);
  const [dialogDuracao, setDialogDuracao] = useState(false);
  const [dadosDuracao, setDadosDuracao] =
    useState<DadosMudancaDuracao | null>(null);
  const [transferenciaPendente, setTransferenciaPendente] = useState<{
    agId: string;
    novoProfId: string;
    novoInicio: number;
  } | null>(null);
  const [dialogConflito, setDialogConflito] = useState(false);
  const [dadosConflito, setDadosConflito] = useState<DadosConflito | null>(
    null,
  );
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
    const update = () =>
      setNowTopPx(calcNowTopPx(slotSize, SLOT_HEIGHT_PX, END_HOUR));
    update();
    const iv = setInterval(update, 60_000);
    return () => clearInterval(iv);
  }, [slotSize, SLOT_HEIGHT_PX]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const profissionaisAtivos = useMemo(
    () =>
      PROFISSIONAIS.filter(
        (p) => p.ativo && (filtroProf === "todos" || p.id === filtroProf),
      ),
    [filtroProf],
  );

  const agPorProfissional = useMemo(() => {
    const map: Record<string, Agendamento[]> = {};
    PROFISSIONAIS.forEach((p) => (map[p.id] = []));
    agendamentos.forEach((ag) => {
      if (map[ag.profissionalId]) map[ag.profissionalId].push(ag);
    });
    return map;
  }, [agendamentos]);

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
      const novaProf = PROFISSIONAIS.find((p) => p.id === newProfId)!;
      const durNovaProf =
        novaProf.tempos[ag.servicoId] ??
        SERVICOS.find((s) => s.id === ag.servicoId)?.tempoPadrao ??
        30;
      let newInicio = snapToSlot(
        ag.inicioMin + deltaSlotsY * slotSize,
        slotSize,
      );
      newInicio = Math.max(
        START_HOUR * 60,
        Math.min(END_HOUR * 60 - durNovaProf, newInicio),
      );

      const conflicts = findConflicts(
        agendamentos,
        newProfId,
        newInicio,
        durNovaProf,
        ag.id,
        bloqueios,
      );
      const agConflitos = conflicts.filter(
        (c): c is Agendamento => !("tipo" in c) || c.tipo !== "bloqueio",
      );
      const bloqueioConflitos = conflicts.filter(
        (c): c is BloqueioHorario => "tipo" in c && c.tipo === "bloqueio",
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
        });
        setConflitoPendente({
          agId: ag.id,
          novoProfId: newProfId,
          novoInicio: newInicio,
        });
        setDialogConflito(true);
        return;
      }

      if (newProfId !== ag.profissionalId) {
        const durAtual = getDuracao(ag);
        if (durNovaProf !== durAtual) {
          const profAtual = PROFISSIONAIS.find(
            (p) => p.id === ag.profissionalId,
          )!;
          const servico = SERVICOS.find((s) => s.id === ag.servicoId)!;
          setDadosDuracao({
            profAnterior: profAtual.nome,
            profNovo: novaProf.nome,
            duracaoAntes: durAtual,
            duracaoDepois: durNovaProf,
            servico: servico.nome,
          });
          setTransferenciaPendente({
            agId: ag.id,
            novoProfId: newProfId,
            novoInicio: newInicio,
          });
          setDialogDuracao(true);
          return;
        }
        setAgendamentos((prev) =>
          prev.map((a) =>
            a.id === ag.id
              ? { ...a, profissionalId: newProfId, inicioMin: newInicio }
              : a,
          ),
        );
        toast.success("Agendamento transferido.");
        return;
      }

      setAgendamentos((prev) =>
        prev.map((a) => (a.id === ag.id ? { ...a, inicioMin: newInicio } : a)),
      );
    },
    [agendamentos, slotSize, SLOT_HEIGHT_PX, bloqueios],
  );

  const confirmarTransferencia = useCallback(() => {
    if (!transferenciaPendente) return;
    const { agId, novoProfId, novoInicio } = transferenciaPendente;
    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === agId
          ? { ...a, profissionalId: novoProfId, inicioMin: novoInicio }
          : a,
      ),
    );
    setTransferenciaPendente(null);
    toast.success("Transferido com nova duração.");
  }, [transferenciaPendente]);

  const confirmarConflito = useCallback(() => {
    if (!conflitoPendente) return;
    const { agId, novoProfId, novoInicio } = conflitoPendente;
    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === agId
          ? { ...a, profissionalId: novoProfId, inicioMin: novoInicio }
          : a,
      ),
    );
    setConflitoPendente(null);
    toast.warning("Agendamento sobreposto confirmado.");
  }, [conflitoPendente]);

  const handleNovoAgendamento = useCallback(
    (dados: Omit<Agendamento, "id">) => {
      setAgendamentos((prev) => [
        ...prev,
        { ...dados, id: gerarAgendamentoId() },
      ]);
      toast.success(`Agendado: ${dados.cliente}`);
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleCardClick = useCallback((ag: Agendamento) => {
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
      const agConflitos = conflicts.filter(
        (c): c is Agendamento => !("tipo" in c) || c.tipo !== "bloqueio",
      );
      if (agConflitos.length > 0) {
        toast.error(
          "Não foi possível redimensionar: conflito com outro agendamento.",
        );
        return;
      }
      setAgendamentos((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const updated: AgendamentoComCustom = {
            ...a,
            _customDuracao: novaDuracao,
          };
          return updated;
        }),
      );
      toast.success("Duração ajustada.");
    },
    [agendamentos, bloqueios],
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
          id: `bl_${Date.now()}`,
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

  const filialAtual = FILIAIS.find((f) => f.id === filialId)!;
  const dataFormatada = format(new Date(), "EEEE, dd MMM yyyy", {
    locale: ptBR,
  });
  const dataCapitalizada =
    dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

  return (
    <>
      <style>{`
        .schedule-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .schedule-scroll::-webkit-scrollbar-track { background: #0d1117; }
        .schedule-scroll::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        .schedule-scroll::-webkit-scrollbar-thumb:hover { background: #484f58; }
        .schedule-scroll { scrollbar-width: thin; scrollbar-color: #30363d #0d1117; }
      `}</style>

      <div className="flex flex-col h-screen bg-surface-base text-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Agendamentos
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {dataCapitalizada}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  <span className="max-w-[120px] truncate text-sm">
                    {filialAtual.nome}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-white">
                {FILIAIS.map((f) => (
                  <DropdownMenuItem
                    key={f.id}
                    onClick={() => setFilialId(f.id)}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      filialId === f.id && "text-brand",
                    )}
                  >
                    <Building2 className="size-3 mr-2" />
                    {f.nome}
                    <span className="text-text-subtle ml-1">· {f.cidade}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center bg-surface-raised border border-border rounded-md h-9 overflow-hidden divide-x divide-[#30363d]">
              <button
                type="button"
                className="h-9 px-2.5 text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-medium text-white px-3 min-w-[60px] text-center">
                {isToday(new Date()) ? "Hoje" : format(new Date(), "dd/MM")}
              </span>
              <button
                type="button"
                className="h-9 px-2.5 text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="flex items-center bg-surface-raised border border-border rounded-md h-9 overflow-hidden divide-x divide-[#30363d]">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "h-9 px-3 flex items-center gap-1.5 text-xs transition-colors",
                  viewMode === "kanban"
                    ? "bg-surface-elevated text-white"
                    : "text-muted-foreground hover:text-white hover:bg-surface-elevated",
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
                    ? "bg-surface-elevated text-white"
                    : "text-muted-foreground hover:text-white hover:bg-surface-elevated",
                )}
              >
                <LayoutList className="size-3.5" />
                Lista
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                  <User className="size-3.5 text-muted-foreground" />
                  <span className="max-w-[90px] truncate text-xs">
                    {filtroProf === "todos"
                      ? "Todos"
                      : PROFISSIONAIS.find((p) => p.id === filtroProf)?.nome}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-white">
                <DropdownMenuItem
                  onClick={() => setFiltroProf("todos")}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    filtroProf === "todos" && "text-brand",
                  )}
                >
                  Todos os profissionais
                </DropdownMenuItem>
                {PROFISSIONAIS.filter((p) => p.ativo).map((p) => (
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

            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                  <Settings2 className="size-3.5 text-muted-foreground" />
                  {slotSize}min
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-white">
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
                  : "border-border bg-surface-raised text-muted-foreground hover:text-white hover:border-red-500/40",
              )}
            >
              <Ban className="size-3.5" />
              {modoBloquear ? "Bloqueando..." : "Bloquear"}
            </button>

            <button
              type="button"
              onClick={() => setDialogComanda(true)}
              className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-white hover:border-[#f5b82e]/40 transition-colors flex items-center gap-1.5"
            >
              <Receipt className="size-3.5 text-muted-foreground" />
              Comanda
            </button>

            <button
              type="button"
              onClick={() => {
                setPrefilledHora(undefined);
                setPrefilledProfId(undefined);
                setDialogNovo(true);
              }}
              className="h-9 px-4 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Novo
            </button>
          </div>
        </div>

        <ResumoDia agendamentos={agendamentos} />

        {viewMode === "kanban" && (
          <div className="flex items-center gap-3 px-4 md:px-6 py-2 border-b border-border-subtle shrink-0 overflow-x-auto schedule-scroll">
            {SERVICOS.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 shrink-0">
                <span className={cn("size-2 rounded-full", s.cor)} />
                <span className="text-[10px] text-muted-foreground">
                  {s.nome}
                </span>
                <span className="text-[9px] text-text-subtle">
                  R$ {s.preco}
                </span>
              </div>
            ))}
            <div className="ml-auto text-[9px] text-text-subtle flex items-center gap-1 shrink-0">
              {modoBloquear ? (
                <span className="text-red-400 font-semibold animate-pulse">
                  🔴 Modo bloqueio ativo — clique e arraste para bloquear
                </span>
              ) : (
                <>
                  <Scissors className="size-3" />
                  Vertical: horário · Horizontal: profissional · Clique no slot
                  para agendar
                </>
              )}
            </div>
          </div>
        )}

        {viewMode === "kanban" ? (
          <div className="flex-1 overflow-auto schedule-scroll">
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
                <div className="flex flex-1 divide-x divide-[#1c2128]">
                  {profissionaisAtivos.map((prof) => (
                    <div
                      key={prof.id}
                      className="relative flex flex-col min-w-[180px] flex-1"
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
                {agendamentoAtivo && (
                  <div
                    className="opacity-90 pointer-events-none"
                    style={{ width: 178 }}
                  >
                    <AgendamentoCard
                      agendamento={agendamentoAtivo}
                      slotSize={slotSize}
                      slotHeightPx={SLOT_HEIGHT_PX}
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ModoLista
              agendamentos={agendamentos}
              onCardClick={handleCardClick}
            />
          </div>
        )}

        <DialogNovoAgendamento
          open={dialogNovo}
          onOpenChange={setDialogNovo}
          onConfirm={handleNovoAgendamento}
          prefilledHora={prefilledHora}
          prefilledProfId={prefilledProfId}
        />
        <DialogDetalhe
          open={dialogDetalhe}
          onOpenChange={setDialogDetalhe}
          agendamento={agSelecionado}
          onDelete={handleDelete}
        />
        <DialogMudancaDuracao
          open={dialogDuracao}
          onOpenChange={setDialogDuracao}
          dados={dadosDuracao}
          onConfirm={confirmarTransferencia}
        />
        <DialogConflito
          open={dialogConflito}
          onOpenChange={setDialogConflito}
          dados={dadosConflito}
          onConfirm={confirmarConflito}
        />
        <DialogNovaComanda
          open={dialogComanda}
          onOpenChange={setDialogComanda}
          agendamentos={agendamentos}
        />
      </div>
    </>
  );
}
