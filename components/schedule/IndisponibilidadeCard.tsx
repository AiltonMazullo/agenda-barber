"use client";

import { CalendarOff, Clock, Coffee, UserX } from "lucide-react";
import { minToTime } from "./helpers";
import { START_HOUR } from "./types";
import type { Indisponibilidade, SlotSize } from "./types";

const ICON_BY_TIPO = {
  "fora-expediente": Clock,
  intervalo: Coffee,
  feriado: CalendarOff,
  folga: UserX,
} as const;

/**
 * Segmento somente leitura (fora do expediente, intervalo, feriado, folga) —
 * ao contrário de `BloqueioCard`, não tem botão de remover: a origem é a
 * configuração do profissional/barbearia, não a agenda. `pointer-events-none`
 * pra nunca interceptar cliques (criar bloqueio, clicar em slot, etc).
 */
export function IndisponibilidadeCard({
  indisponibilidade,
  slotSize,
  slotHeightPx,
}: {
  indisponibilidade: Indisponibilidade;
  slotSize: SlotSize;
  slotHeightPx: number;
}) {
  const duracaoMin = indisponibilidade.fimMin - indisponibilidade.inicioMin;
  const heightPx = (duracaoMin / slotSize) * slotHeightPx;
  const topPx =
    ((indisponibilidade.inicioMin - START_HOUR * 60) / slotSize) * slotHeightPx;
  const Icon = ICON_BY_TIPO[indisponibilidade.tipo];

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        height: heightPx - 2,
        zIndex: 2,
      }}
      className="pointer-events-none"
    >
      <div
        className="absolute left-0.5 right-0.5 rounded-md border border-black/40 flex flex-col overflow-hidden"
        style={{
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.55)",
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 6px, transparent 6px, transparent 12px)",
        }}
      >
        <div className="flex-1 flex flex-col justify-center px-2 py-1 overflow-hidden gap-0.5">
          <div className="flex items-center gap-1 truncate">
            <Icon className="size-2.5 text-slate-300 shrink-0" />
            {heightPx >= 36 && (
              <span className="text-[9px] font-semibold text-slate-300 uppercase tracking-wide truncate">
                {indisponibilidade.label}
              </span>
            )}
          </div>
          {heightPx >= 50 && (
            <span className="text-[9px] text-slate-400 truncate">
              {minToTime(indisponibilidade.inicioMin)}–
              {minToTime(indisponibilidade.fimMin)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
