"use client";

import React, { useCallback, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AgendamentoCard } from "./AgendamentoCard";
import { START_HOUR } from "./types";
import type { AgendamentoVM, ServicoVM, SlotSize } from "./types";

export function DraggableAgendamento({
  agendamento,
  servico,
  slotSize,
  slotHeightPx,
  activeId,
  onCardClick,
  onResizeEnd,
}: {
  agendamento: AgendamentoVM;
  servico: ServicoVM;
  slotSize: SlotSize;
  slotHeightPx: number;
  activeId: string | null;
  onCardClick: (ag: AgendamentoVM) => void;
  onResizeEnd: (id: string, novaDuracao: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: agendamento.id,
    data: { agendamento },
  });

  const duracao = agendamento.duracao;
  const heightPx = (duracao / slotSize) * slotHeightPx;
  const topPx =
    ((agendamento.inicioMin - START_HOUR * 60) / slotSize) * slotHeightPx;
  const isThis = activeId === agendamento.id;

  const isResizing = useRef(false);
  const resizeStartY = useRef(0);
  const resizeStartDur = useRef(0);
  const [resizeDelta, setResizeDelta] = useState(0);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      isResizing.current = true;
      resizeStartY.current = e.clientY;
      resizeStartDur.current = duracao;
      setResizeDelta(0);
      e.currentTarget.setPointerCapture(e.pointerId);

      const handleMove = (ev: PointerEvent) => {
        if (!isResizing.current) return;
        const dy = ev.clientY - resizeStartY.current;
        const deltaSlots = Math.round(dy / slotHeightPx);
        setResizeDelta(deltaSlots * slotSize);
      };

      const handleUp = (ev: PointerEvent) => {
        if (!isResizing.current) return;
        isResizing.current = false;
        const dy = ev.clientY - resizeStartY.current;
        const deltaSlots = Math.round(dy / slotHeightPx);
        const novaDuracao = Math.max(
          slotSize,
          resizeStartDur.current + deltaSlots * slotSize,
        );
        setResizeDelta(0);
        onResizeEnd(agendamento.id, novaDuracao);
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [duracao, slotHeightPx, slotSize, agendamento.id, onResizeEnd],
  );

  const displayDur = Math.max(slotSize, duracao + resizeDelta);
  const displayH = (displayDur / slotSize) * slotHeightPx;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        height: resizeDelta !== 0 ? displayH : heightPx,
        zIndex: isThis ? 0 : 10,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        touchAction: "none",
      }}
      onClick={(e) => {
        if (!transform && !isResizing.current) {
          e.stopPropagation();
          onCardClick(agendamento);
        }
      }}
    >
      <AgendamentoCard
        agendamento={agendamento}
        servico={servico}
        slotSize={slotSize}
        slotHeightPx={slotHeightPx}
        isDragging={isThis}
        onResizeStart={handleResizeStart}
      />
    </div>
  );
}
