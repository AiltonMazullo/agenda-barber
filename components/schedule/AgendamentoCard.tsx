"use client";

import React from "react";
import { Clock, Wifi, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { minToTime } from "./helpers";
import type { AgendamentoVM, ServicoVM, SlotSize } from "./types";

export function AgendamentoCard({
  agendamento,
  servico,
  slotSize,
  slotHeightPx,
  isDragging = false,
  onClick,
  onResizeStart,
}: {
  agendamento: AgendamentoVM;
  servico: ServicoVM;
  slotSize: SlotSize;
  slotHeightPx: number;
  isDragging?: boolean;
  onClick?: () => void;
  onResizeStart?: (e: React.PointerEvent) => void;
}) {
  const duracao = agendamento.duracao;
  const heightPx = (duracao / slotSize) * slotHeightPx;

  return (
    <div
      onClick={onClick}
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md overflow-hidden select-none border-l-[3px] transition-all",
        isDragging ? "opacity-40" : "opacity-100",
        onClick && !isDragging
          ? "cursor-pointer hover:brightness-110"
          : "cursor-grab active:cursor-grabbing",
      )}
      style={{
        height: `${heightPx - 2}px`,
        borderLeftColor: "transparent",
        background: "rgba(28,33,40,0.97)",
        boxShadow: isDragging ? "none" : "0 1px 8px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="h-0.5 w-full"
        style={{ backgroundColor: servico.cor }}
      />
      <div className="px-2 py-1.5 flex flex-col justify-between h-[calc(100%-2px)] overflow-hidden">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span
              className="size-1.5 rounded-full shrink-0"
              style={{ backgroundColor: servico.cor }}
            />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide truncate">
              {servico.nome}
            </span>
            {agendamento.origem === "online" && (
              <Wifi className="size-2.5 text-text-faint ml-auto shrink-0" />
            )}
          </div>
          {heightPx >= 38 && (
            <p className="text-[11px] font-semibold text-foreground truncate leading-tight">
              {agendamento.cliente}
            </p>
          )}
        </div>
        {heightPx >= 54 && (
          <div className="flex items-center gap-1">
            <Clock className="size-2.5 text-text-faint shrink-0" />
            <span className="text-[9px] text-text-faint">
              {minToTime(agendamento.inicioMin)} · {duracao}min
            </span>
          </div>
        )}
      </div>
      {/* Resize handle */}
      {onResizeStart && heightPx >= 28 && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(e);
          }}
          className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center cursor-s-resize group"
        >
          <GripVertical className="size-2.5 text-text-faint group-hover:text-muted-foreground rotate-90 transition-colors" />
        </div>
      )}
    </div>
  );
}
