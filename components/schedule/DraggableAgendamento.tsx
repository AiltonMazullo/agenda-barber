import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Agendamento } from "@/mock/schedule";
import { START_HOUR, type SlotSize } from "@/types/schedule.types";
import { getDuracao } from "@/utils/schedule.utils";
import { AgendamentoCard } from "@/components/schedule/AgendamentoCard";

interface DraggableAgendamentoProps {
  agendamento: Agendamento;
  slotSize: SlotSize;
  slotHeightPx: number;
  activeId: string | null;
  onCardClick: (ag: Agendamento) => void;
  onResizeEnd: (id: string, novaDuracao: number) => void;
}

export function DraggableAgendamento({
  agendamento,
  slotSize,
  slotHeightPx,
  activeId,
  onCardClick,
  onResizeEnd,
}: DraggableAgendamentoProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: agendamento.id,
    data: { agendamento },
  });

  const duracao = getDuracao(agendamento);
  const heightPx = (duracao / slotSize) * slotHeightPx;
  const topPx =
    ((agendamento.inicioMin - START_HOUR * 60) / slotSize) * slotHeightPx;
  const isThis = activeId === agendamento.id;

  const isResizing = useRef(false);
  const resizeStartY = useRef(0);
  const resizeStartDur = useRef(0);
  const [resizeDelta, setResizeDelta] = useState(0);

  const handleResizeStart = useCallback(
    (e: ReactPointerEvent) => {
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
        slotSize={slotSize}
        slotHeightPx={slotHeightPx}
        isDragging={isThis}
        onResizeStart={handleResizeStart}
      />
    </div>
  );
}
