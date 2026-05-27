"use client";

import React, { useCallback, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BloqueioCard } from "./BloqueioCard";
import { DraggableAgendamento } from "./DraggableAgendamento";
import { START_HOUR } from "./types";
import type {
  AgendamentoVM,
  BloqueioHorario,
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
  onCriarBloqueio,
  modoBloquear,
  onSlotClick,
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
  onCriarBloqueio: (
    profId: string,
    inicioMin: number,
    duracaoMin: number,
  ) => void;
  modoBloquear: boolean;
  onSlotClick: (profId: string, inicioMin: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${profissional.id}`,
    data: { profissionalId: profissional.id },
  });

  const bloqueioStart = useRef<number | null>(null);
  const [bloqueioPreview, setBloqueioPreview] = useState<{
    inicio: number;
    fim: number;
  } | null>(null);

  const handleGridPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!modoBloquear) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slotIdx = Math.floor(y / slotHeightPx);
      const minInicio = START_HOUR * 60 + slotIdx * slotSize;
      bloqueioStart.current = minInicio;
      setBloqueioPreview({ inicio: minInicio, fim: minInicio + slotSize });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [modoBloquear, slotHeightPx, slotSize],
  );

  const handleGridPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!modoBloquear || bloqueioStart.current === null) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slotIdx = Math.floor(y / slotHeightPx);
      const minFim = Math.max(
        bloqueioStart.current + slotSize,
        START_HOUR * 60 + (slotIdx + 1) * slotSize,
      );
      setBloqueioPreview({ inicio: bloqueioStart.current, fim: minFim });
    },
    [modoBloquear, slotHeightPx, slotSize],
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

  return (
    <div className="flex flex-col min-w-[180px] flex-1">
      <div className="sticky top-0 z-20 bg-[#0d1117] border-b border-[#21262d] px-3 py-3 flex flex-col items-center gap-1.5">
        <div className="size-9 rounded-full bg-[#f5b82e]/15 border border-[#f5b82e]/30 flex items-center justify-center">
          <span className="text-xs font-bold text-[#f5b82e]">
            {profissional.avatar}
          </span>
        </div>
        <span className="text-[11px] font-bold text-white">
          {profissional.nome}
        </span>
        <Badge className="bg-[#21262d] text-[#8b949e] border-none text-[9px] px-1.5 py-0">
          {agendamentos.length} agend.
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "relative transition-colors",
          isOver && !modoBloquear ? "bg-[#f5b82e]/5" : "",
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
            const inicioMin = START_HOUR * 60 + slotIdx * slotSize;
            onSlotClick(profissional.id, inicioMin);
          }
        }}
      >
        {Array.from({ length: totalSlots }).map((_, i) => {
          const min = START_HOUR * 60 + i * slotSize;
          return (
            <div
              key={i}
              className={cn(
                "slot-row absolute left-0 right-0 border-t hover:bg-[#f5b82e]/3 transition-colors",
                min % 60 === 0 ? "border-[#30363d]" : "border-[#1c2128]",
              )}
              style={{ top: i * slotHeightPx, height: slotHeightPx }}
            />
          );
        })}
        {isOver && !modoBloquear && (
          <div className="absolute inset-0 border-2 border-[#f5b82e]/30 rounded-sm pointer-events-none" />
        )}

        {bloqueioPreview && modoBloquear && (
          <div
            className="absolute left-0.5 right-0.5 bg-red-500/20 border border-red-500/50 rounded pointer-events-none z-20"
            style={{
              top:
                ((bloqueioPreview.inicio - START_HOUR * 60) / slotSize) *
                slotHeightPx,
              height:
                ((bloqueioPreview.fim - bloqueioPreview.inicio) / slotSize) *
                slotHeightPx,
            }}
          />
        )}

        {profBloqueios.map((bl) => (
          <BloqueioCard
            key={bl.id}
            bloqueio={bl}
            slotSize={slotSize}
            slotHeightPx={slotHeightPx}
            onDelete={onDeleteBloqueio}
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
            />
          );
        })}
      </div>
    </div>
  );
}
