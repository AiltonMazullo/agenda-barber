"use client";

import { Clock } from "lucide-react";
import { minToTime } from "./helpers";
import { START_HOUR } from "./types";
import type { SlotSize } from "./types";

export function TimeLine({
  slotSize,
  slotHeightPx,
  totalSlots,
}: {
  slotSize: SlotSize;
  slotHeightPx: number;
  totalSlots: number;
}) {
  return (
    <div className="flex flex-col w-16 shrink-0">
      {/* Cabeçalho: ícone de relógio + "Hora" (alinhado ao header das colunas) */}
      <div className="sticky top-0 z-20 bg-surface-base border-b border-border-subtle h-[92px] flex items-center justify-center gap-1.5">
        <Clock className="size-3.5 text-brand" />
        <span className="text-[11px] font-bold text-foreground">Hora</span>
      </div>
      <div className="relative" style={{ height: totalSlots * slotHeightPx }}>
        {Array.from({ length: totalSlots }).map((_, i) => {
          const min = START_HOUR * 60 + i * slotSize;
          return (
            <div
              key={i}
              className="absolute right-2 left-0 flex items-start justify-end"
              style={{ top: i * slotHeightPx, height: slotHeightPx }}
            >
              <span className="text-[10px] font-bold text-foreground leading-none">
                {minToTime(min)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
