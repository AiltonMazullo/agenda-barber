"use client";

import React from "react";
import { Clock, Wifi, Monitor, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/utils/format";
import { minToTime } from "./helpers";
import { STATUS_COR } from "./status";
import { AgendamentoIcones } from "./AgendamentoIcones";
import type { AgendamentoVM, ServicoVM, SlotSize } from "./types";

export function AgendamentoCard({
  agendamento,
  servico,
  slotSize,
  slotHeightPx,
  isDragging = false,
  isResizing = false,
  onClick,
  onResizeStart,
  onNavigateProfissional,
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
  /** "Sem preferência" (§3.1): navega o card pra outro profissional livre, sem abrir o detalhe. */
  onNavigateProfissional?: (ag: AgendamentoVM, direction: "prev" | "next") => void;
}) {
  const duracao = agendamento.duracao;
  const heightPx = (duracao / slotSize) * slotHeightPx;
  const statusCor = STATUS_COR[agendamento.status];
  // spec-ajustes-escopo-1.md §2.3: até o cliente chegar (status ainda
  // PENDING/CONFIRMED), a borda do card usa a cor do plano do cliente (se
  // tiver); assim que o status avançar (Chegou/Em andamento/Concluído/
  // Falta/Cancelado) volta a usar a cor do status.
  const aindaNaoChegou = agendamento.status === "PENDING" || agendamento.status === "CONFIRMED";
  const corBorda = aindaNaoChegou && agendamento.planCor ? agendamento.planCor : statusCor;

  return (
    <div
      onClick={onClick}
      title={
        agendamento.telefone
          ? `${agendamento.cliente} · ${formatPhone(agendamento.telefone)}`
          : agendamento.cliente
      }
      className={cn(
        // Padding lateral maior (era left-0.5/right-0.5, quase colado nas
        // bordas) — deixa a faixa colorida do plano (atrás, na grade)
        // visível nas laterais do card, melhorando a identificação.
        "absolute left-1.5 right-1.5 rounded-md overflow-hidden select-none transition-all",
        isDragging ? "opacity-40" : isResizing ? "opacity-50" : "opacity-100",
        onClick && !isDragging
          ? "cursor-pointer hover:brightness-110"
          : "cursor-grab active:cursor-grabbing",
      )}
      style={{
        height: `${heightPx - 2}px`,
        // "Sem preferência de profissional" (employeeId null, ver DialogDetalhe
        // item 4): fundo listrado diagonal em vez de sólido, pra diferenciar o
        // card visualmente de um agendamento com profissional definido. A cor
        // do plano do cliente não fica no fundo do card (ficava sólida demais)
        // — fica só na borda, até o cliente chegar (§2.3, `corBorda` acima).
        // Fundo do card levemente translúcido (em vez de opaco) — deixa a
        // faixa colorida do plano (atrás, na grade) transparecer sutilmente
        // por trás do card, sem pintar o card inteiro de sólido.
        background: agendamento.semPreferencia
          ? "repeating-linear-gradient(135deg, rgba(28,33,40,0.85) 0px, rgba(28,33,40,0.85) 6px, rgba(255,255,255,0.06) 6px, rgba(255,255,255,0.06) 12px)"
          : "rgba(28,33,40,0.82)",
        // Bordas laterais e inferior conforme a situação do agendamento —
        // cor do plano antes do cliente chegar, cor do status depois (§2.3).
        borderLeft: `3px solid ${corBorda}`,
        borderRight: `1.5px solid ${corBorda}`,
        borderBottom: `2px solid ${corBorda}`,
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
      {/* Navegação entre profissionais (§3.1) — só em cards "sem preferência" */}
      {agendamento.semPreferencia && onNavigateProfissional && heightPx >= 28 && (
        <div className="absolute top-1 right-1 flex items-center gap-0.5 z-20">
          <button
            type="button"
            title="Trocar para o profissional anterior"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateProfissional(agendamento, "prev");
            }}
            className="size-4 rounded-sm flex items-center justify-center bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-2.5" />
          </button>
          <button
            type="button"
            title="Trocar para o próximo profissional"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateProfissional(agendamento, "next");
            }}
            className="size-4 rounded-sm flex items-center justify-center bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-colors"
          >
            <ChevronRight className="size-2.5" />
          </button>
        </div>
      )}
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
