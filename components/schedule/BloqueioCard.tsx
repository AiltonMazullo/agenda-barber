"use client";

import { useCallback, useRef, useState } from "react";
import { Ban, X } from "lucide-react";
import { minToTime } from "./helpers";
import { START_HOUR } from "./types";
import type { BloqueioHorario, SlotSize } from "./types";

/**
 * Bloqueio/intervalo — arrastar (mover início) e redimensionar (mudar
 * duração) além de excluir (ver spec-revisao-cliente-1.md §5.5). Usa
 * pointer events diretos (não dnd-kit) por ser um card independente do
 * sistema de drag-and-drop de agendamentos.
 */
export function BloqueioCard({
  bloqueio,
  slotSize,
  slotHeightPx,
  onDelete,
  onMove,
  onResize,
  startHour = START_HOUR,
}: {
  bloqueio: BloqueioHorario;
  slotSize: SlotSize;
  slotHeightPx: number;
  onDelete: (id: string) => void;
  onMove: (id: string, novoInicioMin: number) => void;
  onResize: (id: string, novaDuracaoMin: number) => void;
  startHour?: number;
}) {
  const heightPx = (bloqueio.duracaoMin / slotSize) * slotHeightPx;
  const topPx =
    ((bloqueio.inicioMin - startHour * 60) / slotSize) * slotHeightPx;

  const [dragDeltaSlots, setDragDeltaSlots] = useState(0);
  const [resizeDeltaSlots, setResizeDeltaSlots] = useState(0);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const startY = useRef(0);

  const handleMoveStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      isDragging.current = true;
      startY.current = e.clientY;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const handleMove = (ev: PointerEvent) => {
        if (!isDragging.current) return;
        const dy = ev.clientY - startY.current;
        setDragDeltaSlots(Math.round(dy / slotHeightPx));
      };
      const handleUp = (ev: PointerEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const dy = ev.clientY - startY.current;
        const deltaSlots = Math.round(dy / slotHeightPx);
        setDragDeltaSlots(0);
        if (deltaSlots !== 0) {
          const novoInicio = Math.max(
            startHour * 60,
            bloqueio.inicioMin + deltaSlots * slotSize,
          );
          onMove(bloqueio.id, novoInicio);
        }
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [slotHeightPx, slotSize, startHour, bloqueio.inicioMin, bloqueio.id, onMove],
  );

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      isResizing.current = true;
      startY.current = e.clientY;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const handleMove = (ev: PointerEvent) => {
        if (!isResizing.current) return;
        const dy = ev.clientY - startY.current;
        setResizeDeltaSlots(Math.round(dy / slotHeightPx));
      };
      const handleUp = (ev: PointerEvent) => {
        if (!isResizing.current) return;
        isResizing.current = false;
        const dy = ev.clientY - startY.current;
        const deltaSlots = Math.round(dy / slotHeightPx);
        setResizeDeltaSlots(0);
        const novaDuracao = Math.max(
          slotSize,
          bloqueio.duracaoMin + deltaSlots * slotSize,
        );
        if (novaDuracao !== bloqueio.duracaoMin) onResize(bloqueio.id, novaDuracao);
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [slotHeightPx, slotSize, bloqueio.duracaoMin, bloqueio.id, onResize],
  );

  const displayTop = topPx + dragDeltaSlots * slotHeightPx;
  const displayHeight = heightPx - 2 + resizeDeltaSlots * slotHeightPx;

  return (
    <div
      style={{
        position: "absolute",
        top: displayTop,
        left: 0,
        right: 0,
        height: displayHeight,
        zIndex: isDragging.current || isResizing.current ? 15 : 5,
        touchAction: "none",
      }}
      className="opacity-80"
    >
      <div
        onPointerDown={handleMoveStart}
        className="absolute left-0.5 right-0.5 rounded-md border border-red-500/40 bg-red-500/10 flex flex-col overflow-hidden group cursor-grab active:cursor-grabbing"
        style={{ height: "100%" }}
      >
        <div className="h-0.5 w-full bg-red-500/60" />
        <div className="flex-1 flex items-center justify-between px-2 py-1 overflow-hidden gap-1">
          <div className="flex flex-col min-w-0 gap-0.5">
            <div className="flex items-center gap-1 truncate">
              <Ban className="size-2.5 text-red-400 shrink-0" />
              {heightPx >= 36 && (
                <span className="text-[9px] font-bold text-red-400/80 uppercase tracking-wide truncate">
                  {bloqueio.motivo || "Bloqueado"}
                </span>
              )}
            </div>
            {heightPx >= 50 && (
              <span className="text-[9px] text-red-400/60 truncate">
                {minToTime(bloqueio.inicioMin)}–
                {minToTime(bloqueio.inicioMin + bloqueio.duracaoMin)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bloqueio.id);
            }}
            className="size-4 rounded flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
          >
            <X className="size-2.5" />
          </button>
        </div>
        <div
          onPointerDown={handleResizeStart}
          className="h-1.5 w-full cursor-ns-resize hover:bg-red-500/40 transition-colors shrink-0"
        />
      </div>
    </div>
  );
}
