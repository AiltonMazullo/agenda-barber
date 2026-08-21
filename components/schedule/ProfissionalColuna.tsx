"use client";

import React, { useCallback, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BloqueioCard } from "./BloqueioCard";
import { IndisponibilidadeCard } from "./IndisponibilidadeCard";
import { DraggableAgendamento } from "./DraggableAgendamento";
import { hexToRgba } from "./helpers";
import { START_HOUR } from "./types";
import type {
  AgendamentoVM,
  BloqueioHorario,
  Indisponibilidade,
  ProfissionalVM,
  ServicoVM,
  SlotSize,
} from "./types";

export function ProfissionalColuna({
  profissional,
  agendamentos,
  servicoById,
  slotSize,
  slotHeightPx,
  totalSlots,
  activeId,
  onCardClick,
  onResizeEnd,
  bloqueios,
  onDeleteBloqueio,
  onMoveBloqueio,
  onResizeBloqueio,
  onCriarBloqueio,
  modoBloquear,
  onSlotClick,
  indisponibilidades,
  startHour = START_HOUR,
  disabled = false,
}: {
  profissional: ProfissionalVM;
  agendamentos: AgendamentoVM[];
  servicoById: Map<string, ServicoVM>;
  slotSize: SlotSize;
  slotHeightPx: number;
  totalSlots: number;
  activeId: string | null;
  onCardClick: (ag: AgendamentoVM) => void;
  onResizeEnd: (id: string, novaDuracao: number) => void;
  bloqueios: BloqueioHorario[];
  onDeleteBloqueio: (id: string) => void;
  onMoveBloqueio: (id: string, novoInicioMin: number) => void;
  onResizeBloqueio: (id: string, novaDuracaoMin: number) => void;
  onCriarBloqueio: (
    profId: string,
    inicioMin: number,
    duracaoMin: number,
  ) => void;
  modoBloquear: boolean;
  onSlotClick: (profId: string, inicioMin: number) => void;
  /** Fora do expediente/intervalo/feriado/folga — somente leitura (ver `buildIndisponibilidades`). */
  indisponibilidades: Indisponibilidade[];
  /** Início da grade, em horas — ver §5.1 (range dinâmico por profissionais do dia). */
  startHour?: number;
  /**
   * Coluna somente leitura (usada pela pseudo-coluna "Sem preferência"): não
   * aceita drop nem criação de bloqueio, já que não há um `Employee` real
   * por trás para persistir essas ações no backend.
   */
  disabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${profissional.id}`,
    data: { profissionalId: profissional.id },
    disabled,
  });

  const bloqueioStart = useRef<number | null>(null);
  const [bloqueioPreview, setBloqueioPreview] = useState<{
    inicio: number;
    fim: number;
  } | null>(null);

  const handleGridPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!modoBloquear || disabled) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slotIdx = Math.floor(y / slotHeightPx);
      const minInicio = startHour * 60 + slotIdx * slotSize;
      bloqueioStart.current = minInicio;
      setBloqueioPreview({ inicio: minInicio, fim: minInicio + slotSize });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [modoBloquear, disabled, slotHeightPx, slotSize, startHour],
  );

  const handleGridPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!modoBloquear || bloqueioStart.current === null) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slotIdx = Math.floor(y / slotHeightPx);
      const minFim = Math.max(
        bloqueioStart.current + slotSize,
        startHour * 60 + (slotIdx + 1) * slotSize,
      );
      setBloqueioPreview({ inicio: bloqueioStart.current, fim: minFim });
    },
    [modoBloquear, slotHeightPx, slotSize, startHour],
  );

  const handleGridPointerUp = useCallback(() => {
    if (!modoBloquear || bloqueioStart.current === null || !bloqueioPreview)
      return;
    const dur = bloqueioPreview.fim - bloqueioPreview.inicio;
    if (dur >= slotSize)
      onCriarBloqueio(profissional.id, bloqueioPreview.inicio, dur);
    bloqueioStart.current = null;
    setBloqueioPreview(null);
  }, [
    modoBloquear,
    bloqueioPreview,
    slotSize,
    onCriarBloqueio,
    profissional.id,
  ]);

  const profBloqueios = bloqueios.filter(
    (b) => b.profissionalId === profissional.id || b.profissionalId === "todos",
  );
  const profIndisponibilidades = indisponibilidades.filter(
    (i) => i.profissionalId === profissional.id,
  );

  return (
    <div className="flex flex-col flex-1 min-w-[140px]">
      <div className="sticky top-0 z-20 bg-surface-base border-b border-border-subtle h-[92px] px-2 flex flex-col items-center justify-center gap-1">
        <div
          className="size-8 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0 bg-cover bg-center overflow-hidden"
          style={
            profissional.fotoUrl
              ? { backgroundImage: `url(${profissional.fotoUrl})` }
              : undefined
          }
        >
          {!profissional.fotoUrl && (
            <span className="text-[10px] font-bold text-brand">
              {profissional.avatar}
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold text-foreground leading-none truncate max-w-full">
          {profissional.nome}
        </span>
        <Badge className="bg-surface-elevated text-muted-foreground border-none text-[9px] px-1.5 py-0 leading-tight">
          {agendamentos.length} agend.
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "relative transition-colors",
          isOver && !modoBloquear ? "bg-brand/5" : "",
          modoBloquear ? "cursor-crosshair" : "",
        )}
        style={{ height: totalSlots * slotHeightPx }}
        onPointerDown={handleGridPointerDown}
        onPointerMove={handleGridPointerMove}
        onPointerUp={handleGridPointerUp}
        onClick={(e) => {
          if (modoBloquear) return;
          const target = e.target as HTMLElement;
          if (
            target === e.currentTarget ||
            target.classList.contains("slot-row")
          ) {
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const slotIdx = Math.floor(y / slotHeightPx);
            const inicioMin = startHour * 60 + slotIdx * slotSize;
            // Fora do expediente/intervalo/feriado/folga: não deixa criar
            // agendamento nesse horário (o backend rejeitaria de qualquer
            // forma — bloqueamos aqui pra não abrir o dialog à toa).
            const indisponivel = profIndisponibilidades.find(
              (ind) => inicioMin >= ind.inicioMin && inicioMin < ind.fimMin,
            );
            if (indisponivel) {
              toast.error(`Horário indisponível (${indisponivel.label}).`);
              return;
            }
            onSlotClick(profissional.id, inicioMin);
          }
        }}
      >
        {Array.from({ length: totalSlots }).map((_, i) => {
          const min = startHour * 60 + i * slotSize;
          return (
            <div
              key={i}
              className={cn(
                "slot-row absolute left-0 right-0 border-t hover:bg-brand/3 transition-colors",
                min % 60 === 0 ? "border-border" : "border-border-subtle",
              )}
              style={{ top: i * slotHeightPx, height: slotHeightPx }}
            />
          );
        })}
        {isOver && !modoBloquear && (
          <div className="absolute inset-0 border-2 border-brand/30 rounded-sm pointer-events-none" />
        )}

        {bloqueioPreview && modoBloquear && (
          <div
            className="absolute left-0.5 right-0.5 bg-red-500/20 border border-red-500/50 rounded pointer-events-none z-20"
            style={{
              top:
                ((bloqueioPreview.inicio - startHour * 60) / slotSize) *
                slotHeightPx,
              height:
                ((bloqueioPreview.fim - bloqueioPreview.inicio) / slotSize) *
                slotHeightPx,
            }}
          />
        )}

        {/* Cliente assinante: a cor do plano tinge a faixa da grade que o
            agendamento ocupa (não mais o card em si, que ficava sólido
            demais) — identificação rápida sem "gritar" na agenda
            (spec-revisao-cliente-4.md §3.1). Fica atrás dos cards. */}
        {agendamentos.map((ag) => {
          if (!ag.planCor) return null;
          const topPx =
            ((ag.inicioMin - startHour * 60) / slotSize) * slotHeightPx;
          const heightPx = (ag.duracao / slotSize) * slotHeightPx;
          return (
            <div
              key={`plan-bg-${ag.id}`}
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: topPx,
                height: heightPx,
                backgroundColor: hexToRgba(ag.planCor, 0.16),
              }}
            />
          );
        })}

        {profIndisponibilidades.map((ind) => (
          <IndisponibilidadeCard
            key={ind.id}
            indisponibilidade={ind}
            slotSize={slotSize}
            slotHeightPx={slotHeightPx}
            startHour={startHour}
          />
        ))}

        {profBloqueios.map((bl) => (
          <BloqueioCard
            key={bl.id}
            bloqueio={bl}
            slotSize={slotSize}
            slotHeightPx={slotHeightPx}
            onDelete={onDeleteBloqueio}
            onMove={onMoveBloqueio}
            onResize={onResizeBloqueio}
            startHour={startHour}
          />
        ))}

        {agendamentos.map((ag) => {
          const servico = servicoById.get(ag.servicoId);
          if (!servico) return null;
          return (
            <DraggableAgendamento
              key={ag.id}
              agendamento={ag}
              servico={servico}
              slotSize={slotSize}
              slotHeightPx={slotHeightPx}
              activeId={activeId}
              onCardClick={onCardClick}
              onResizeEnd={onResizeEnd}
              startHour={startHour}
            />
          );
        })}
      </div>
    </div>
  );
}
