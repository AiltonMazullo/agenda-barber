"use client";

import React from "react";
import { Clock, Wifi, Monitor, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { minToTime } from "./helpers";
import { STATUS_COR } from "./status";
import { AgendamentoIcones } from "./AgendamentoIcones";
import type { AgendamentoVM, ServicoVM, SlotSize } from "./types";

/** `#rrggbb` -> `rgba(r,g,b,alpha)`. Cai para preto se a cor vier num formato inesperado. */
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return `rgba(28,33,40,${alpha})`;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function AgendamentoCard({
  agendamento,
  servico,
  slotSize,
  slotHeightPx,
  isDragging = false,
  isResizing = false,
  onClick,
  onResizeStart,
}: {
  agendamento: AgendamentoVM;
  servico: ServicoVM;
  slotSize: SlotSize;
  slotHeightPx: number;
  isDragging?: boolean;
  /** Card sendo redimensionado (§5.3) — reduz opacidade enquanto mostra a prévia tracejada. */
  isResizing?: boolean;
  onClick?: () => void;
  onResizeStart?: (e: React.PointerEvent) => void;
}) {
  const duracao = agendamento.duracao;
  const heightPx = (duracao / slotSize) * slotHeightPx;
  const statusCor = STATUS_COR[agendamento.status];
  // Cliente assinante: fundo ganha a cor do plano bem saturada, pra
  // identificação rápida direto na agenda (spec-revisao-cliente-4.md §3.1,
  // ajuste pedido pelo dono — o tint de 28% ficava sutil demais pra bater o
  // olho) — a borda continua na cor do status (não muda de significado).
  const planBg = agendamento.planCor ? hexToRgba(agendamento.planCor, 0.6) : null;

  return (
    <div
      onClick={onClick}
      title={
        agendamento.telefone
          ? `${agendamento.cliente} · ${agendamento.telefone}`
          : agendamento.cliente
      }
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md overflow-hidden select-none transition-all",
        isDragging ? "opacity-40" : isResizing ? "opacity-50" : "opacity-100",
        onClick && !isDragging
          ? "cursor-pointer hover:brightness-110"
          : "cursor-grab active:cursor-grabbing",
      )}
      style={{
        height: `${heightPx - 2}px`,
        // "Sem preferência de profissional" (employeeId null, ver DialogDetalhe
        // item 4): fundo listrado diagonal em vez de sólido, pra diferenciar o
        // card visualmente de um agendamento com profissional definido.
        background: agendamento.semPreferencia
          ? `repeating-linear-gradient(135deg, ${planBg ?? "rgba(28,33,40,0.97)"} 0px, ${planBg ?? "rgba(28,33,40,0.97)"} 6px, rgba(255,255,255,0.06) 6px, rgba(255,255,255,0.06) 12px)`
          : (planBg ?? "rgba(28,33,40,0.97)"),
        // Bordas laterais e inferior conforme a situação do agendamento.
        borderLeft: `3px solid ${statusCor}`,
        borderRight: `1.5px solid ${statusCor}`,
        borderBottom: `2px solid ${statusCor}`,
        boxShadow: isDragging ? "none" : "0 1px 8px rgba(0,0,0,0.5)",
      }}
    >
      {/* Linha superior na cor do serviço */}
      <div className="h-1 w-full" style={{ backgroundColor: servico.cor }} />
      <div className="px-2 py-1.5 flex flex-col justify-between h-[calc(100%-4px)] overflow-hidden">
        <div>
          {/* Nome do cliente primeiro */}
          <div className="flex items-center gap-1">
            <p className="text-[11px] font-semibold text-foreground truncate leading-tight flex-1">
              {agendamento.cliente}
            </p>
            {agendamento.origem === "online" ? (
              <Wifi className="size-2.5 text-text-faint shrink-0" />
            ) : (
              <Monitor className="size-2.5 text-text-faint shrink-0" />
            )}
          </div>
          {/* Serviço(s) abaixo — combo mostra todos os nomes juntos */}
          {heightPx >= 36 && (
            <div className="flex items-start gap-1 mt-0.5">
              <span
                className="size-1.5 rounded-full shrink-0 mt-[3px]"
                style={{ backgroundColor: servico.cor }}
              />
              <span className="text-[9px] text-muted-foreground line-clamp-2">
                {agendamento.servicos.length > 0
                  ? agendamento.servicos.map((s) => s.nome).join(", ")
                  : servico.nome}
              </span>
            </div>
          )}
          {/* Ícones de situação (assinante, aniversário, confirmação, nota...) */}
          {heightPx >= 36 && (
            <div className="mt-0.5">
              <AgendamentoIcones agendamento={agendamento} />
            </div>
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
