/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings2,
  Calendar,
  Scissors,
  X,
  Phone,
  User,
  FileText,
  Wifi,
  UserCheck,
  Trash2,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  SERVICOS,
  PROFISSIONAIS,
  AGENDAMENTOS_MOCK,
  type Agendamento,
  type Profissional,
} from "@/mock/schedule";
import { isToday } from "date-fns";

// ─── Constantes ───────────────────────────────────────────────────────────────

const SLOT_OPTIONS = [10, 20, 30] as const;
const START_HOUR = 8;
const END_HOUR = 20;
type SlotSize = 10 | 20 | 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDuracao(ag: Agendamento, profId?: string): number {
  const targetProfId = profId ?? ag.profissionalId;
  const prof = PROFISSIONAIS.find((p) => p.id === targetProfId);
  const servico = SERVICOS.find((s) => s.id === ag.servicoId);
  return prof?.tempos[ag.servicoId] ?? servico?.tempoPadrao ?? 30;
}

function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function snapToSlot(min: number, slotSize: SlotSize): number {
  return Math.round(min / slotSize) * slotSize;
}

function gerarId(): string {
  return `ag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── DropdownButton ───────────────────────────────────────────────────────────
// Wrapper para evitar button>button: usa div como trigger

function DropdownButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="button" tabIndex={0} className={className}>
      {children}
    </div>
  );
}

// ─── Dialog: Novo Agendamento ─────────────────────────────────────────────────

function DialogNovoAgendamento({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (ag: Omit<Agendamento, "id">) => void;
}) {
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servicoId, setServicoId] = useState(SERVICOS[0].id);
  const [profissionalId, setProfissionalId] = useState(PROFISSIONAIS[0].id);
  const [hora, setHora] = useState("09:00");
  const [observacao, setObservacao] = useState("");
  const [origem, setOrigem] = useState<"online" | "recepcao">("recepcao");

  const servico = SERVICOS.find((s) => s.id === servicoId)!;
  const prof = PROFISSIONAIS.find((p) => p.id === profissionalId)!;
  const duracao = prof.tempos[servicoId] ?? servico.tempoPadrao;

  const handleConfirm = () => {
    if (!cliente.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    const [h, m] = hora.split(":").map(Number);
    onConfirm({
      cliente,
      telefone,
      servicoId,
      profissionalId,
      inicioMin: h * 60 + (m || 0),
      observacao,
      origem,
    });
    onOpenChange(false);
    setCliente("");
    setTelefone("");
    setObservacao("");
    setHora("09:00");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Novo Agendamento
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Cliente */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
              Cliente
            </label>
            <Input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
              Telefone
            </label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(81) 99999-0000"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          {/* Serviço + Profissional */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
                Serviço
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <DropdownButton className="w-full h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={cn(
                          "size-2 rounded-full shrink-0",
                          servico.cor,
                        )}
                      />
                      <span className="truncate text-sm">{servico.nome}</span>
                    </div>
                    <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
                  </DropdownButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white w-48">
                  {SERVICOS.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => setServicoId(s.id)}
                      className="text-xs hover:bg-[#21262d] cursor-pointer"
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full mr-2 shrink-0",
                          s.cor,
                        )}
                      />
                      {s.nome}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
                Profissional
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <DropdownButton className="w-full h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                    <span className="truncate text-sm">{prof.nome}</span>
                    <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
                  </DropdownButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
                  {PROFISSIONAIS.filter((p) => p.ativo).map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => setProfissionalId(p.id)}
                      className="text-xs hover:bg-[#21262d] cursor-pointer"
                    >
                      {p.nome}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Horário */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
              Horário
            </label>
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          {/* Origem */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
              Origem
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["recepcao", "online"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrigem(o)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                    origem === o
                      ? "bg-[#f5b82e]/15 border-[#f5b82e]/60 text-[#f5b82e]"
                      : "border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#f5b82e]/30",
                  )}
                >
                  {o === "recepcao" ? (
                    <UserCheck className="size-3.5" />
                  ) : (
                    <Wifi className="size-3.5" />
                  )}
                  {o === "recepcao" ? "Recepção" : "Online"}
                </button>
              ))}
            </div>
          </div>

          {/* Info calculada */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0d1117] border border-[#21262d]">
            <Timer className="size-3.5 text-[#f5b82e]" />
            <span className="text-xs text-[#8b949e]">Duração estimada:</span>
            <span className="text-xs font-bold text-white">{duracao} min</span>
            <span className="text-xs text-[#4d5562] ml-auto">
              R$ {servico.preco.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
              Observação
            </label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 resize-none min-h-[70px]"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors"
          >
            Agendar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog: Detalhe ──────────────────────────────────────────────────────────

function DialogDetalhe({
  open,
  onOpenChange,
  agendamento,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agendamento: Agendamento | null;
  onDelete: (id: string) => void;
}) {
  if (!agendamento) return null;
  const servico = SERVICOS.find((s) => s.id === agendamento.servicoId)!;
  const prof = PROFISSIONAIS.find((p) => p.id === agendamento.profissionalId)!;
  const duracao = getDuracao(agendamento);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-sm p-0 gap-0">
        <div className={cn("h-1 w-full rounded-t-lg", servico.cor)} />
        <DialogHeader className="px-6 pt-4 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", servico.cor)} />
              <DialogTitle className="text-base font-bold">
                {servico.nome}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-3">
          <InfoRow
            icon={<User className="size-3.5" />}
            label="Cliente"
            value={agendamento.cliente}
          />
          <InfoRow
            icon={<Phone className="size-3.5" />}
            label="Telefone"
            value={agendamento.telefone || "—"}
          />
          <InfoRow
            icon={<Scissors className="size-3.5" />}
            label="Profissional"
            value={prof.nome}
          />
          <InfoRow
            icon={<Clock className="size-3.5" />}
            label="Horário"
            value={`${minToTime(agendamento.inicioMin)} – ${minToTime(agendamento.inicioMin + duracao)} (${duracao}min)`}
          />
          <InfoRow
            icon={
              agendamento.origem === "online" ? (
                <Wifi className="size-3.5" />
              ) : (
                <UserCheck className="size-3.5" />
              )
            }
            label="Origem"
            value={agendamento.origem === "online" ? "Online" : "Recepção"}
          />
          {agendamento.observacao && (
            <InfoRow
              icon={<FileText className="size-3.5" />}
              label="Obs."
              value={agendamento.observacao}
            />
          )}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-[#8b949e]">Valor do serviço</span>
            <span className="text-sm font-bold text-emerald-400">
              R$ {servico.preco.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onDelete(agendamento.id);
              onOpenChange(false);
              toast.success("Agendamento removido.");
            }}
            className="h-9 px-4 rounded-md border border-red-500/30 bg-red-500/10 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Remover
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-[#4d5562] mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#4d5562]">
          {label}
        </span>
        <span className="text-sm text-white leading-tight">{value}</span>
      </div>
    </div>
  );
}

// ─── Dialog: Mudança de duração ───────────────────────────────────────────────

function DialogMudancaDuracao({
  open,
  onOpenChange,
  dados,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dados: {
    profAnterior: string;
    profNovo: string;
    duracaoAntes: number;
    duracaoDepois: number;
    servico: string;
  } | null;
  onConfirm: () => void;
}) {
  if (!dados) return null;
  const diff = dados.duracaoDepois - dados.duracaoAntes;
  const aumentou = diff > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-sm p-0 gap-0">
        <div
          className={cn(
            "h-1 w-full rounded-t-lg",
            aumentou ? "bg-amber-500" : "bg-emerald-500",
          )}
        />
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={cn(
                  "size-4",
                  aumentou ? "text-amber-400" : "text-emerald-400",
                )}
              />
              <DialogTitle className="text-base font-bold">
                Duração diferente
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-[#8b949e] leading-relaxed">
            Ao transferir{" "}
            <span className="text-white font-semibold">{dados.servico}</span>{" "}
            para{" "}
            <span className="text-white font-semibold">{dados.profNovo}</span>,
            o tempo será{" "}
            <span
              className={cn(
                "font-bold",
                aumentou ? "text-amber-400" : "text-emerald-400",
              )}
            >
              {aumentou
                ? `${Math.abs(diff)}min a mais`
                : `${Math.abs(diff)}min a menos`}
            </span>{" "}
            que com{" "}
            <span className="text-white font-semibold">
              {dados.profAnterior}
            </span>
            .
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#4d5562] mb-1">
                {dados.profAnterior}
              </p>
              <p className="text-xl font-bold text-white">
                {dados.duracaoAntes}
                <span className="text-xs text-[#4d5562] ml-0.5">min</span>
              </p>
            </div>
            <div
              className={cn(
                "border rounded-lg p-3 text-center",
                aumentou
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30",
              )}
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#4d5562] mb-1">
                {dados.profNovo}
              </p>
              <p
                className={cn(
                  "text-xl font-bold",
                  aumentou ? "text-amber-400" : "text-emerald-400",
                )}
              >
                {dados.duracaoDepois}
                <span className="text-xs ml-0.5 opacity-60">min</span>
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#4d5562]">
            O card será redimensionado automaticamente.
          </p>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors"
          >
            Confirmar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── AgendamentoCard ──────────────────────────────────────────────────────────

function AgendamentoCard({
  agendamento,
  slotSize,
  slotHeightPx,
  isDragging = false,
  onClick,
}: {
  agendamento: Agendamento;
  slotSize: SlotSize;
  slotHeightPx: number;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  const servico = SERVICOS.find((s) => s.id === agendamento.servicoId)!;
  const duracao = getDuracao(agendamento);
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
        background: "rgba(22,27,34,0.97)",
        boxShadow: isDragging ? "none" : "0 1px 8px rgba(0,0,0,0.5)",
      }}
    >
      <div className={cn("h-0.5 w-full", servico.cor)} />
      <div className="px-2 py-1.5 flex flex-col justify-between h-[calc(100%-2px)] overflow-hidden">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span
              className={cn("size-1.5 rounded-full shrink-0", servico.cor)}
            />
            <span className="text-[9px] font-bold text-[#8b949e] uppercase tracking-wide truncate">
              {servico.nome}
            </span>
            {agendamento.origem === "online" && (
              <Wifi className="size-2.5 text-[#4d5562] ml-auto shrink-0" />
            )}
          </div>
          {heightPx >= 38 && (
            <p className="text-[11px] font-semibold text-white truncate leading-tight">
              {agendamento.cliente}
            </p>
          )}
        </div>
        {heightPx >= 54 && (
          <div className="flex items-center gap-1">
            <Clock className="size-2.5 text-[#4d5562] shrink-0" />
            <span className="text-[9px] text-[#4d5562]">
              {minToTime(agendamento.inicioMin)} · {duracao}min
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DraggableAgendamento ─────────────────────────────────────────────────────

function DraggableAgendamento({
  agendamento,
  slotSize,
  slotHeightPx,
  activeId,
  onCardClick,
}: {
  agendamento: Agendamento;
  slotSize: SlotSize;
  slotHeightPx: number;
  activeId: string | null;
  onCardClick: (ag: Agendamento) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: agendamento.id,
    data: { agendamento },
  });

  const duracao = getDuracao(agendamento);
  const heightPx = (duracao / slotSize) * slotHeightPx;
  const topPx =
    ((agendamento.inicioMin - START_HOUR * 60) / slotSize) * slotHeightPx;
  const isThis = activeId === agendamento.id;

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
        height: heightPx,
        zIndex: isThis ? 0 : 10,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        touchAction: "none",
      }}
      onClick={(e) => {
        if (!transform) {
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
      />
    </div>
  );
}

// ─── ProfissionalColuna ───────────────────────────────────────────────────────

function ProfissionalColuna({
  profissional,
  agendamentos,
  slotSize,
  slotHeightPx,
  totalSlots,
  activeId,
  onCardClick,
}: {
  profissional: Profissional;
  agendamentos: Agendamento[];
  slotSize: SlotSize;
  slotHeightPx: number;
  totalSlots: number;
  activeId: string | null;
  onCardClick: (ag: Agendamento) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${profissional.id}`,
    data: { profissionalId: profissional.id },
  });

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
          isOver ? "bg-[#f5b82e]/5" : "",
        )}
        style={{ height: totalSlots * slotHeightPx }}
      >
        {Array.from({ length: totalSlots }).map((_, i) => {
          const min = START_HOUR * 60 + i * slotSize;
          return (
            <div
              key={i}
              className={cn(
                "absolute left-0 right-0 border-t",
                min % 60 === 0 ? "border-[#30363d]" : "border-[#1c2128]",
              )}
              style={{ top: i * slotHeightPx }}
            />
          );
        })}
        {isOver && (
          <div className="absolute inset-0 border-2 border-[#f5b82e]/30 rounded-sm pointer-events-none" />
        )}
        {agendamentos.map((ag) => (
          <DraggableAgendamento
            key={ag.id}
            agendamento={ag}
            slotSize={slotSize}
            slotHeightPx={slotHeightPx}
            activeId={activeId}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}

// ─── TimeLine ─────────────────────────────────────────────────────────────────

function TimeLine({
  slotSize,
  slotHeightPx,
  totalSlots,
}: {
  slotSize: SlotSize;
  slotHeightPx: number;
  totalSlots: number;
}) {
  return (
    <div className="flex flex-col w-14 shrink-0">
      <div className="sticky top-0 z-20 bg-[#0d1117] border-b border-[#21262d] h-[92px]" />
      <div className="relative" style={{ height: totalSlots * slotHeightPx }}>
        {Array.from({ length: totalSlots }).map((_, i) => {
          const min = START_HOUR * 60 + i * slotSize;
          return (
            <div
              key={i}
              className="absolute right-2 flex items-start"
              style={{ top: i * slotHeightPx - 7 }}
            >
              {min % 60 === 0 && (
                <span className="text-[9px] text-[#4d5562] font-mono">
                  {minToTime(min)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [agendamentos, setAgendamentos] =
    useState<Agendamento[]>(AGENDAMENTOS_MOCK);
  const [slotSize, setSlotSize] = useState<SlotSize>(10);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Dialogs
  const [dialogNovo, setDialogNovo] = useState(false);
  const [dialogDetalhe, setDialogDetalhe] = useState(false);
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null);
  const [dialogDuracao, setDialogDuracao] = useState(false);
  const [dadosDuracao, setDadosDuracao] = useState<any>(null);
  const [transferenciaPendente, setTransferenciaPendente] = useState<{
    agId: string;
    novoProfId: string;
    novoInicio: number;
  } | null>(null);

  // "Agora" calculado no cliente
  const [nowTopPx, setNowTopPx] = useState<number | null>(null);
  const SLOT_HEIGHT_PX = slotSize === 10 ? 28 : slotSize === 20 ? 40 : 56;
  const totalSlots = ((END_HOUR - START_HOUR) * 60) / slotSize;

  useEffect(() => {
    const calcNow = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60) {
        setNowTopPx(((nowMin - START_HOUR * 60) / slotSize) * SLOT_HEIGHT_PX);
      } else {
        setNowTopPx(null);
      }
    };
    calcNow();
    const interval = setInterval(calcNow, 60_000);
    return () => clearInterval(interval);
  }, [slotSize, SLOT_HEIGHT_PX]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const agPorProfissional = useMemo(() => {
    const map: Record<string, Agendamento[]> = {};
    PROFISSIONAIS.forEach((p) => {
      map[p.id] = [];
    });
    agendamentos.forEach((ag) => {
      if (map[ag.profissionalId]) map[ag.profissionalId].push(ag);
    });
    return map;
  }, [agendamentos]);

  const agendamentoAtivo = useMemo(
    () => agendamentos.find((a) => a.id === activeId) ?? null,
    [activeId, agendamentos],
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over, delta } = e;
      if (!over) return;
      const ag = agendamentos.find((a) => a.id === active.id);
      if (!ag) return;

      const overData = over.data?.current as
        | { profissionalId?: string }
        | undefined;
      const newProfId = overData?.profissionalId ?? ag.profissionalId;
      const deltaSlotsY = Math.round(delta.y / SLOT_HEIGHT_PX);
      const novaProf = PROFISSIONAIS.find((p) => p.id === newProfId)!;
      const durNovaProf =
        novaProf.tempos[ag.servicoId] ??
        SERVICOS.find((s) => s.id === ag.servicoId)?.tempoPadrao ??
        30;
      let newInicio = snapToSlot(
        ag.inicioMin + deltaSlotsY * slotSize,
        slotSize,
      );
      newInicio = Math.max(
        START_HOUR * 60,
        Math.min(END_HOUR * 60 - durNovaProf, newInicio),
      );

      if (newProfId === ag.profissionalId) {
        setAgendamentos((prev) =>
          prev.map((a) =>
            a.id === ag.id ? { ...a, inicioMin: newInicio } : a,
          ),
        );
        return;
      }

      const durAtual = getDuracao(ag);
      if (durNovaProf !== durAtual) {
        const profAtual = PROFISSIONAIS.find(
          (p) => p.id === ag.profissionalId,
        )!;
        const servico = SERVICOS.find((s) => s.id === ag.servicoId)!;
        setDadosDuracao({
          profAnterior: profAtual.nome,
          profNovo: novaProf.nome,
          duracaoAntes: durAtual,
          duracaoDepois: durNovaProf,
          servico: servico.nome,
        });
        setTransferenciaPendente({
          agId: ag.id,
          novoProfId: newProfId,
          novoInicio: newInicio,
        });
        setDialogDuracao(true);
      } else {
        setAgendamentos((prev) =>
          prev.map((a) =>
            a.id === ag.id
              ? { ...a, profissionalId: newProfId, inicioMin: newInicio }
              : a,
          ),
        );
        toast.success("Agendamento transferido.");
      }
    },
    [agendamentos, slotSize, SLOT_HEIGHT_PX],
  );

  const confirmarTransferencia = useCallback(() => {
    if (!transferenciaPendente) return;
    const { agId, novoProfId, novoInicio } = transferenciaPendente;
    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === agId
          ? { ...a, profissionalId: novoProfId, inicioMin: novoInicio }
          : a,
      ),
    );
    setTransferenciaPendente(null);
    toast.success("Transferido com nova duração.");
  }, [transferenciaPendente]);

  const handleNovoAgendamento = useCallback(
    (dados: Omit<Agendamento, "id">) => {
      setAgendamentos((prev) => [...prev, { ...dados, id: gerarId() }]);
      toast.success(`Agendado: ${dados.cliente}`);
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleCardClick = useCallback((ag: Agendamento) => {
    setAgSelecionado(ag);
    setDialogDetalhe(true);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-white overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-[#21262d] shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Agenda
          </h1>
          <p className="text-[#8b949e] text-sm mt-0.5">
            Kanban por profissional · drag & drop
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Navegação de data */}
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-md h-9 overflow-hidden divide-x divide-[#30363d]">
            <button
              type="button"
              className="h-9 px-2.5 text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium text-white px-3 min-w-[180px] text-center">
              {isToday(new Date())
                ? "Hoje"
                : new Date().toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
            </span>
            <button
              type="button"
              className="h-9 px-2.5 text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <button
            type="button"
            className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white hover:border-[#f5b82e]/40 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="size-3.5 text-[#8b949e]" />
            Hoje
          </button>

          {/* Slot size — usando DropdownMenuTrigger com div filho */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <DropdownButton className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                <Settings2 className="size-3.5 text-[#8b949e]" />
                {slotSize}min
                <ChevronDown className="size-3.5 text-[#8b949e]" />
              </DropdownButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
              {SLOT_OPTIONS.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setSlotSize(s)}
                  className={cn(
                    "text-xs hover:bg-[#21262d] cursor-pointer",
                    slotSize === s && "text-[#f5b82e]",
                  )}
                >
                  {s} minutos {slotSize === s && "✓"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => setDialogNovo(true)}
            className="h-9 px-4 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo
          </button>
        </div>
      </div>

      {/* ── Legenda ── */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-2 border-b border-[#1c2128] shrink-0 overflow-x-auto">
        {SERVICOS.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 shrink-0">
            <span className={cn("size-2 rounded-full", s.cor)} />
            <span className="text-[10px] text-[#8b949e]">{s.nome}</span>
            <span className="text-[9px] text-[#4d5562]">R$ {s.preco}</span>
          </div>
        ))}
        <div className="ml-auto text-[9px] text-[#4d5562] flex items-center gap-1 shrink-0">
          <Scissors className="size-3" />
          Vertical: horário · Horizontal: profissional
        </div>
      </div>

      {/* ── Kanban ── */}
      <div className="flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-full">
            <TimeLine
              slotSize={slotSize}
              slotHeightPx={SLOT_HEIGHT_PX}
              totalSlots={totalSlots}
            />
            <div className="w-px bg-[#21262d] shrink-0" />
            <div className="flex flex-1 divide-x divide-[#1c2128]">
              {PROFISSIONAIS.filter((p) => p.ativo).map((prof) => (
                <div
                  key={prof.id}
                  className="relative flex flex-col min-w-[180px] flex-1"
                >
                  {nowTopPx !== null && (
                    <div
                      className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                      style={{ top: 92 + nowTopPx }}
                    >
                      <div className="size-2 rounded-full bg-red-500 shrink-0 -ml-1" />
                      <div className="flex-1 h-px bg-red-500/50" />
                    </div>
                  )}
                  <ProfissionalColuna
                    profissional={prof}
                    agendamentos={agPorProfissional[prof.id] ?? []}
                    slotSize={slotSize}
                    slotHeightPx={SLOT_HEIGHT_PX}
                    totalSlots={totalSlots}
                    activeId={activeId}
                    onCardClick={handleCardClick}
                  />
                </div>
              ))}
            </div>
          </div>

          <DragOverlay>
            {agendamentoAtivo && (
              <div
                className="opacity-90 pointer-events-none"
                style={{ width: 178 }}
              >
                <AgendamentoCard
                  agendamento={agendamentoAtivo}
                  slotSize={slotSize}
                  slotHeightPx={SLOT_HEIGHT_PX}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── Dialogs ── */}
      <DialogNovoAgendamento
        open={dialogNovo}
        onOpenChange={setDialogNovo}
        onConfirm={handleNovoAgendamento}
      />
      <DialogDetalhe
        open={dialogDetalhe}
        onOpenChange={setDialogDetalhe}
        agendamento={agSelecionado}
        onDelete={handleDelete}
      />
      <DialogMudancaDuracao
        open={dialogDuracao}
        onOpenChange={setDialogDuracao}
        dados={dadosDuracao}
        onConfirm={confirmarTransferencia}
      />
    </div>
  );
}
