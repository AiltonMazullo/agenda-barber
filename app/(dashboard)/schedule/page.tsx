/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
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
  LayoutList,
  LayoutGrid,
  Building2,
  Filter,
  Search,
  TrendingUp,
  DollarSign,
  Users,
  Ban,
  Receipt,
  GripVertical,
  ChevronUp,
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
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  SERVICOS,
  PROFISSIONAIS,
  AGENDAMENTOS_MOCK,
  type Agendamento,
  type Profissional,
} from "@/mock/schedule";

// ─── Constantes ───────────────────────────────────────────────────────────────

const SLOT_OPTIONS = [10, 20, 30] as const;
const START_HOUR = 8;
const END_HOUR = 20;
type SlotSize = 10 | 20 | 30;
type ViewMode = "kanban" | "lista";

// ─── Filiais mock ─────────────────────────────────────────────────────────────

const FILIAIS = [
  { id: "fil_1", nome: "Filial Centro", cidade: "Recife" },
  { id: "fil_2", nome: "Filial Boa Viagem", cidade: "Recife" },
  { id: "fil_3", nome: "Filial Olinda", cidade: "Olinda" },
];

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

/** Retorna true se dois intervalos se sobrepõem */
function checkOverlap(
  aInicio: number,
  aDuracao: number,
  bInicio: number,
  bDuracao: number,
): boolean {
  const aFim = aInicio + aDuracao;
  const bFim = bInicio + bDuracao;
  return aInicio < bFim && aFim > bInicio;
}

/** Encontra agendamentos conflitantes (excluindo o próprio) */
function findConflicts(
  agendamentos: Agendamento[],
  profissionalId: string,
  inicioMin: number,
  duracao: number,
  excludeId?: string,
  bloqueios?: BloqueioHorario[],
): Array<Agendamento | BloqueioHorario> {
  const conflicts: Array<Agendamento | BloqueioHorario> = [];

  agendamentos.forEach((ag) => {
    if (excludeId && ag.id === excludeId) return;
    if (ag.profissionalId !== profissionalId) return;
    const d = getDuracao(ag);
    if (checkOverlap(inicioMin, duracao, ag.inicioMin, d)) {
      conflicts.push(ag);
    }
  });

  bloqueios?.forEach((bl) => {
    if (bl.profissionalId !== profissionalId && bl.profissionalId !== "todos")
      return;
    if (checkOverlap(inicioMin, duracao, bl.inicioMin, bl.duracaoMin)) {
      conflicts.push(bl);
    }
  });

  return conflicts;
}

// ─── Tipos extras ─────────────────────────────────────────────────────────────

interface BloqueioHorario {
  id: string;
  profissionalId: string; // "todos" para todos
  inicioMin: number;
  duracaoMin: number;
  motivo?: string;
  tipo: "bloqueio";
}

// ─── DropdownButton ───────────────────────────────────────────────────────────

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
  prefilledHora,
  prefilledProfId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (ag: Omit<Agendamento, "id">) => void;
  prefilledHora?: string;
  prefilledProfId?: string;
}) {
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servicoId, setServicoId] = useState(SERVICOS[0].id);
  const [profissionalId, setProfissionalId] = useState(
    prefilledProfId ?? PROFISSIONAIS[0].id,
  );
  const [hora, setHora] = useState(prefilledHora ?? "09:00");
  const [observacao, setObservacao] = useState("");
  const [origem, setOrigem] = useState<"online" | "recepcao">("recepcao");

  useEffect(() => {
    if (open) {
      if (prefilledHora) setHora(prefilledHora);
      if (prefilledProfId) setProfissionalId(prefilledProfId);
    }
  }, [open, prefilledHora, prefilledProfId]);

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

          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0d1117] border border-[#21262d]">
            <Timer className="size-3.5 text-[#f5b82e]" />
            <span className="text-xs text-[#8b949e]">Duração estimada:</span>
            <span className="text-xs font-bold text-white">{duracao} min</span>
            <span className="text-xs text-[#4d5562] ml-auto">
              R$ {servico.preco.toFixed(2).replace(".", ",")}
            </span>
          </div>

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

// ─── Dialog: Conflito de Horário ──────────────────────────────────────────────

function DialogConflito({
  open,
  onOpenChange,
  dados,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dados: {
    agMovendo: Agendamento;
    conflitantes: Agendamento[];
    novoInicio: number;
    novoProfId: string;
  } | null;
  onConfirm: () => void;
}) {
  if (!dados) return null;
  const servMovendo = SERVICOS.find((s) => s.id === dados.agMovendo.servicoId)!;
  const durMovendo = getDuracao(dados.agMovendo, dados.novoProfId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <div className="h-1 w-full rounded-t-lg bg-red-500" />
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-400" />
              <DialogTitle className="text-base font-bold">
                Conflito de Horário
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
          <p className="text-sm text-[#8b949e]">
            O agendamento abaixo conflita com{" "}
            <span className="text-white font-semibold">
              {dados.conflitantes.length} agendamento
              {dados.conflitantes.length > 1 ? "s" : ""}
            </span>{" "}
            existente{dados.conflitantes.length > 1 ? "s" : ""}. Deseja sobrepor
            mesmo assim?
          </p>

          {/* Card movendo */}
          <div className="rounded-lg border border-[#f5b82e]/40 bg-[#f5b82e]/5 p-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#f5b82e] mb-2">
              Movendo
            </p>
            <div className="flex items-center gap-2">
              <span
                className={cn("size-2 rounded-full shrink-0", servMovendo.cor)}
              />
              <span className="text-sm font-semibold text-white">
                {dados.agMovendo.cliente}
              </span>
              <span className="text-xs text-[#8b949e] ml-auto">
                {minToTime(dados.novoInicio)} –{" "}
                {minToTime(dados.novoInicio + durMovendo)}
              </span>
            </div>
            <p className="text-xs text-[#4d5562] mt-1">
              {servMovendo.nome} · {durMovendo}min
            </p>
          </div>

          {/* Conflitantes */}
          <div className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">
              Conflito com
            </p>
            {dados.conflitantes.map((c) => {
              const s = SERVICOS.find((sv) => sv.id === c.servicoId)!;
              const d = getDuracao(c);
              return (
                <div
                  key={c.id}
                  className="rounded-lg border border-red-500/30 bg-red-500/5 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("size-2 rounded-full shrink-0", s.cor)}
                    />
                    <span className="text-sm font-semibold text-white">
                      {c.cliente}
                    </span>
                    <span className="text-xs text-[#8b949e] ml-auto">
                      {minToTime(c.inicioMin)} – {minToTime(c.inicioMin + d)}
                    </span>
                  </div>
                  <p className="text-xs text-[#4d5562] mt-1">
                    {s.nome} · {d}min
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-500/5 border border-red-500/20">
            <AlertTriangle className="size-3.5 text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300/80">
              Sobrepor agendamentos pode prejudicar a qualidade do atendimento.
            </p>
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
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="h-9 px-5 rounded-md text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Sobrepor mesmo assim
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog: Nova Comanda ─────────────────────────────────────────────────────

function DialogNovaComanda({
  open,
  onOpenChange,
  agendamentos,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agendamentos: Agendamento[];
}) {
  const [agSelecionadoId, setAgSelecionadoId] = useState<string | null>(null);

  const handleGerar = () => {
    if (!agSelecionadoId) {
      toast.error("Selecione um agendamento para gerar a comanda.");
      return;
    }
    const ag = agendamentos.find((a) => a.id === agSelecionadoId)!;
    const servico = SERVICOS.find((s) => s.id === ag.servicoId)!;
    toast.success(
      `Comanda gerada para ${ag.cliente} — ${servico.nome} (R$ ${servico.preco.toFixed(2)})`,
    );
    onOpenChange(false);
    setAgSelecionadoId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-[#f5b82e]" />
              <DialogTitle className="text-base font-bold">
                Nova Comanda
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
        <div className="px-6 py-5 space-y-3 max-h-80 overflow-y-auto">
          <p className="text-xs text-[#8b949e]">
            Selecione o agendamento para criar uma comanda:
          </p>
          {agendamentos.length === 0 && (
            <p className="text-sm text-[#4d5562] text-center py-4">
              Nenhum agendamento disponível.
            </p>
          )}
          {agendamentos.map((ag) => {
            const s = SERVICOS.find((sv) => sv.id === ag.servicoId)!;
            const p = PROFISSIONAIS.find((pr) => pr.id === ag.profissionalId)!;
            const d = getDuracao(ag);
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => setAgSelecionadoId(ag.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  agSelecionadoId === ag.id
                    ? "border-[#f5b82e]/60 bg-[#f5b82e]/10"
                    : "border-[#30363d] bg-[#0d1117] hover:border-[#f5b82e]/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full shrink-0", s.cor)} />
                  <span className="text-sm font-semibold text-white">
                    {ag.cliente}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 ml-auto">
                    R$ {s.preco.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#8b949e]">{s.nome}</span>
                  <span className="text-[10px] text-[#4d5562]">·</span>
                  <span className="text-xs text-[#8b949e]">{p.nome}</span>
                  <span className="text-[10px] text-[#4d5562]">·</span>
                  <span className="text-xs text-[#8b949e]">
                    {minToTime(ag.inicioMin)} ({d}min)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-[#21262d] pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGerar}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors flex items-center gap-1.5"
          >
            <Receipt className="size-3.5" />
            Gerar Comanda
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Resumo do Dia ────────────────────────────────────────────────────────────

function ResumoDia({ agendamentos }: { agendamentos: Agendamento[] }) {
  const total = agendamentos.length;
  const faturamento = agendamentos.reduce((acc, ag) => {
    const s = SERVICOS.find((sv) => sv.id === ag.servicoId);
    return acc + (s?.preco ?? 0);
  }, 0);

  const servicoCount = agendamentos.reduce<Record<string, number>>(
    (acc, ag) => {
      acc[ag.servicoId] = (acc[ag.servicoId] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const topServico = Object.entries(servicoCount).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topServicoNome = topServico
    ? (SERVICOS.find((s) => s.id === topServico[0])?.nome ?? "—")
    : "—";

  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b border-[#1c2128] shrink-0 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d]">
        <Users className="size-3.5 text-[#f5b82e]" />
        <span className="text-[10px] text-[#8b949e]">Atendimentos</span>
        <span className="text-sm font-bold text-white">{total}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d]">
        <DollarSign className="size-3.5 text-emerald-400" />
        <span className="text-[10px] text-[#8b949e]">Faturamento</span>
        <span className="text-sm font-bold text-emerald-400">
          R$ {faturamento.toFixed(2).replace(".", ",")}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d]">
        <TrendingUp className="size-3.5 text-blue-400" />
        <span className="text-[10px] text-[#8b949e]">Mais realizado</span>
        <span className="text-sm font-bold text-white truncate max-w-[120px]">
          {topServicoNome}
        </span>
        {topServico && (
          <span className="text-[10px] text-[#4d5562]">({topServico[1]}x)</span>
        )}
      </div>
    </div>
  );
}

// ─── Modo Lista ───────────────────────────────────────────────────────────────

function ModoLista({
  agendamentos,
  onCardClick,
}: {
  agendamentos: Agendamento[];
  onCardClick: (ag: Agendamento) => void;
}) {
  const [filtroServico, setFiltroServico] = useState("todos");
  const [filtroProf, setFiltroProf] = useState("todos");
  const [filtroOrigem, setFiltroOrigem] = useState("todos");
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    return agendamentos
      .filter((ag) => {
        if (filtroServico !== "todos" && ag.servicoId !== filtroServico)
          return false;
        if (filtroProf !== "todos" && ag.profissionalId !== filtroProf)
          return false;
        if (filtroOrigem !== "todos" && ag.origem !== filtroOrigem)
          return false;
        if (busca && !ag.cliente.toLowerCase().includes(busca.toLowerCase()))
          return false;
        return true;
      })
      .sort((a, b) => a.inicioMin - b.inicioMin);
  }, [agendamentos, filtroServico, filtroProf, filtroOrigem, busca]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Filtros */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-[#21262d] shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Search className="size-3.5 text-[#4d5562] shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4d5562] outline-none min-w-0"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-xs text-white flex items-center gap-1.5 cursor-pointer">
              <Scissors className="size-3 text-[#8b949e]" />
              {filtroServico === "todos"
                ? "Todos serviços"
                : SERVICOS.find((s) => s.id === filtroServico)?.nome}
              <ChevronDown className="size-3 text-[#8b949e]" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
            <DropdownMenuItem
              onClick={() => setFiltroServico("todos")}
              className="text-xs hover:bg-[#21262d]"
            >
              Todos
            </DropdownMenuItem>
            {SERVICOS.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => setFiltroServico(s.id)}
                className="text-xs hover:bg-[#21262d]"
              >
                <span className={cn("size-2 rounded-full mr-2", s.cor)} />
                {s.nome}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-xs text-white flex items-center gap-1.5 cursor-pointer">
              <User className="size-3 text-[#8b949e]" />
              {filtroProf === "todos"
                ? "Todos prof."
                : PROFISSIONAIS.find((p) => p.id === filtroProf)?.nome}
              <ChevronDown className="size-3 text-[#8b949e]" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
            <DropdownMenuItem
              onClick={() => setFiltroProf("todos")}
              className="text-xs hover:bg-[#21262d]"
            >
              Todos
            </DropdownMenuItem>
            {PROFISSIONAIS.filter((p) => p.ativo).map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => setFiltroProf(p.id)}
                className="text-xs hover:bg-[#21262d]"
              >
                {p.nome}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-xs text-white flex items-center gap-1.5 cursor-pointer">
              {filtroOrigem === "todos"
                ? "Todas origens"
                : filtroOrigem === "online"
                  ? "Online"
                  : "Recepção"}
              <ChevronDown className="size-3 text-[#8b949e]" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("todos")}
              className="text-xs hover:bg-[#21262d]"
            >
              Todas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("recepcao")}
              className="text-xs hover:bg-[#21262d]"
            >
              Recepção
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("online")}
              className="text-xs hover:bg-[#21262d]"
            >
              Online
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-[11px] text-[#4d5562] ml-auto shrink-0">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto schedule-scroll px-4 md:px-6 py-4">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#4d5562]">
            <Filter className="size-8 mb-3 opacity-40" />
            <p className="text-sm">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtrados.map((ag) => {
              const s = SERVICOS.find((sv) => sv.id === ag.servicoId)!;
              const p = PROFISSIONAIS.find(
                (pr) => pr.id === ag.profissionalId,
              )!;
              const d = getDuracao(ag);
              return (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => onCardClick(ag)}
                  className="w-full text-left rounded-lg border border-[#21262d] bg-[#161b22] hover:border-[#30363d] hover:bg-[#1c2128] transition-colors p-3 flex items-center gap-3"
                >
                  <div
                    className={cn(
                      "w-0.5 self-stretch rounded-full shrink-0",
                      s.cor,
                    )}
                  />
                  <div className="flex-1 grid grid-cols-4 gap-2 items-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {ag.cliente}
                      </p>
                      {ag.telefone && (
                        <p className="text-xs text-[#4d5562] truncate">
                          {ag.telefone}
                        </p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 rounded-full shrink-0",
                            s.cor,
                          )}
                        />
                        <p className="text-xs text-[#8b949e] truncate">
                          {s.nome}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#8b949e] truncate">
                        {p.nome}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-white font-mono">
                        {minToTime(ag.inicioMin)}
                      </span>
                      <span className="text-[10px] text-[#4d5562]">{d}min</span>
                      {ag.origem === "online" ? (
                        <Wifi className="size-3 text-[#4d5562]" />
                      ) : (
                        <UserCheck className="size-3 text-[#4d5562]" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 shrink-0">
                    R$ {s.preco.toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AgendamentoCard ──────────────────────────────────────────────────────────

function AgendamentoCard({
  agendamento,
  slotSize,
  slotHeightPx,
  isDragging = false,
  onClick,
  onResizeStart,
}: {
  agendamento: Agendamento;
  slotSize: SlotSize;
  slotHeightPx: number;
  isDragging?: boolean;
  onClick?: () => void;
  onResizeStart?: (e: React.PointerEvent) => void;
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
        background: "rgba(28,33,40,0.97)",
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
      {/* Resize handle */}
      {onResizeStart && heightPx >= 28 && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(e);
          }}
          className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center cursor-s-resize group"
        >
          <GripVertical className="size-2.5 text-[#4d5562] group-hover:text-[#8b949e] rotate-90 transition-colors" />
        </div>
      )}
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
  onResizeEnd,
  allAgendamentos,
  bloqueios,
}: {
  agendamento: Agendamento;
  slotSize: SlotSize;
  slotHeightPx: number;
  activeId: string | null;
  onCardClick: (ag: Agendamento) => void;
  onResizeEnd: (id: string, novaDuracao: number) => void;
  allAgendamentos: Agendamento[];
  bloqueios: BloqueioHorario[];
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

  // Resize state
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
        slotSize={slotSize}
        slotHeightPx={slotHeightPx}
        isDragging={isThis}
        onResizeStart={handleResizeStart}
      />
    </div>
  );
}

// ─── BloqueioCard ─────────────────────────────────────────────────────────────

function BloqueioCard({
  bloqueio,
  slotSize,
  slotHeightPx,
  onDelete,
}: {
  bloqueio: BloqueioHorario;
  slotSize: SlotSize;
  slotHeightPx: number;
  onDelete: (id: string) => void;
}) {
  const heightPx = (bloqueio.duracaoMin / slotSize) * slotHeightPx;
  const topPx =
    ((bloqueio.inicioMin - START_HOUR * 60) / slotSize) * slotHeightPx;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        height: heightPx - 2,
        zIndex: 5,
      }}
      className="opacity-80"
    >
      <div
        className="absolute left-0.5 right-0.5 rounded-md border border-red-500/40 bg-red-500/10 flex flex-col overflow-hidden group"
        style={{ height: "100%" }}
      >
        <div className="h-0.5 w-full bg-red-500/60" />
        <div className="flex-1 flex items-center justify-between px-2 py-1 overflow-hidden">
          <div className="flex items-center gap-1 truncate">
            <Ban className="size-2.5 text-red-400 shrink-0" />
            {heightPx >= 36 && (
              <span className="text-[9px] font-bold text-red-400/80 uppercase tracking-wide truncate">
                {bloqueio.motivo || "Bloqueado"}
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
      </div>
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
  onResizeEnd,
  allAgendamentos,
  bloqueios,
  onDeleteBloqueio,
  modoBloquear,
  onSlotClick,
}: {
  profissional: Profissional;
  agendamentos: Agendamento[];
  slotSize: SlotSize;
  slotHeightPx: number;
  totalSlots: number;
  activeId: string | null;
  onCardClick: (ag: Agendamento) => void;
  onResizeEnd: (id: string, novaDuracao: number) => void;
  allAgendamentos: Agendamento[];
  bloqueios: BloqueioHorario[];
  onDeleteBloqueio: (id: string) => void;
  modoBloquear: boolean;
  onSlotClick: (profId: string, inicioMin: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${profissional.id}`,
    data: { profissionalId: profissional.id },
  });

  // Bloqueio via drag no grid
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

  const handleGridPointerUp = useCallback(
    (
      e: React.PointerEvent<HTMLDivElement>,
      onCreated: (inicio: number, dur: number) => void,
    ) => {
      if (!modoBloquear || bloqueioStart.current === null || !bloqueioPreview)
        return;
      const dur = bloqueioPreview.fim - bloqueioPreview.inicio;
      if (dur >= slotSize) onCreated(bloqueioPreview.inicio, dur);
      bloqueioStart.current = null;
      setBloqueioPreview(null);
    },
    [modoBloquear, bloqueioPreview, slotSize],
  );

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
        onPointerUp={(e) =>
          handleGridPointerUp(e, (inicio, dur) => {
            onCreated(profissional.id, inicio, dur);
          })
        }
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

        {/* Bloqueio preview */}
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

        {/* Bloqueios */}
        {profBloqueios.map((bl) => (
          <BloqueioCard
            key={bl.id}
            bloqueio={bl}
            slotSize={slotSize}
            slotHeightPx={slotHeightPx}
            onDelete={onDeleteBloqueio}
          />
        ))}

        {/* Agendamentos */}
        {agendamentos.map((ag) => (
          <DraggableAgendamento
            key={ag.id}
            agendamento={ag}
            slotSize={slotSize}
            slotHeightPx={slotHeightPx}
            activeId={activeId}
            onCardClick={onCardClick}
            onResizeEnd={onResizeEnd}
            allAgendamentos={allAgendamentos}
            bloqueios={bloqueios}
          />
        ))}
      </div>
    </div>
  );
}

// Placeholder para a função onCreated usada no handler acima
function onCreated(_profId: string, _inicio: number, _dur: number) {}

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

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [agendamentos, setAgendamentos] =
    useState<Agendamento[]>(AGENDAMENTOS_MOCK);
  const [bloqueios, setBloqueios] = useState<BloqueioHorario[]>([]);
  const [slotSize, setSlotSize] = useState<SlotSize>(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filtroProf, setFiltroProf] = useState<string>("todos");
  const [filialId, setFilialId] = useState<string>(FILIAIS[0].id);
  const [modoBloquear, setModoBloquear] = useState(false);

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
  const [dialogConflito, setDialogConflito] = useState(false);
  const [dadosConflito, setDadosConflito] = useState<any>(null);
  const [conflitoPendente, setConflitoPendente] = useState<{
    agId: string;
    novoProfId: string;
    novoInicio: number;
  } | null>(null);
  const [dialogComanda, setDialogComanda] = useState(false);

  // Slot click
  const [prefilledHora, setPrefilledHora] = useState<string | undefined>();
  const [prefilledProfId, setPrefilledProfId] = useState<string | undefined>();

  const SLOT_HEIGHT_PX = slotSize === 10 ? 28 : slotSize === 20 ? 40 : 56;
  const totalSlots = ((END_HOUR - START_HOUR) * 60) / slotSize;

  const [nowTopPx, setNowTopPx] = useState<number | null>(null);

  useEffect(() => {
    const calcNow = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60) {
        setNowTopPx(((nowMin - START_HOUR * 60) / slotSize) * SLOT_HEIGHT_PX);
      } else setNowTopPx(null);
    };
    calcNow();
    const iv = setInterval(calcNow, 60_000);
    return () => clearInterval(iv);
  }, [slotSize, SLOT_HEIGHT_PX]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const profissionaisAtivos = useMemo(
    () =>
      PROFISSIONAIS.filter(
        (p) => p.ativo && (filtroProf === "todos" || p.id === filtroProf),
      ),
    [filtroProf],
  );

  const agPorProfissional = useMemo(() => {
    const map: Record<string, Agendamento[]> = {};
    PROFISSIONAIS.forEach((p) => (map[p.id] = []));
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

      // ── Verificar conflitos ──────────────────────────────────────────────
      const conflicts = findConflicts(
        agendamentos,
        newProfId,
        newInicio,
        durNovaProf,
        ag.id,
        bloqueios,
      );
      const agConflitos = conflicts.filter(
        (c) => (c as any).tipo !== "bloqueio",
      ) as Agendamento[];
      const bloqueioConflitos = conflicts.filter(
        (c) => (c as any).tipo === "bloqueio",
      ) as BloqueioHorario[];

      if (bloqueioConflitos.length > 0) {
        toast.error("Horário bloqueado! Não é possível agendar neste período.");
        return;
      }

      if (agConflitos.length > 0) {
        setDadosConflito({
          agMovendo: ag,
          conflitantes: agConflitos,
          novoInicio: newInicio,
          novoProfId: newProfId,
        });
        setConflitoPendente({
          agId: ag.id,
          novoProfId: newProfId,
          novoInicio: newInicio,
        });
        setDialogConflito(true);
        return;
      }

      // ── Verificar mudança de duração ─────────────────────────────────────
      if (newProfId !== ag.profissionalId) {
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
          return;
        }
        setAgendamentos((prev) =>
          prev.map((a) =>
            a.id === ag.id
              ? { ...a, profissionalId: newProfId, inicioMin: newInicio }
              : a,
          ),
        );
        toast.success("Agendamento transferido.");
        return;
      }

      setAgendamentos((prev) =>
        prev.map((a) => (a.id === ag.id ? { ...a, inicioMin: newInicio } : a)),
      );
    },
    [agendamentos, slotSize, SLOT_HEIGHT_PX, bloqueios],
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

  const confirmarConflito = useCallback(() => {
    if (!conflitoPendente) return;
    const { agId, novoProfId, novoInicio } = conflitoPendente;
    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === agId
          ? { ...a, profissionalId: novoProfId, inicioMin: novoInicio }
          : a,
      ),
    );
    setConflitoPendente(null);
    toast.warning("Agendamento sobreposto confirmado.");
  }, [conflitoPendente]);

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

  const handleResizeEnd = useCallback(
    (id: string, novaDuracao: number) => {
      const ag = agendamentos.find((a) => a.id === id);
      if (!ag) return;
      const conflicts = findConflicts(
        agendamentos,
        ag.profissionalId,
        ag.inicioMin,
        novaDuracao,
        id,
        bloqueios,
      );
      const agConflitos = conflicts.filter(
        (c) => (c as any).tipo !== "bloqueio",
      ) as Agendamento[];
      if (agConflitos.length > 0) {
        toast.error(
          "Não foi possível redimensionar: conflito com outro agendamento.",
        );
        return;
      }
      setAgendamentos((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const prof = PROFISSIONAIS.find((p) => p.id === a.profissionalId)!;
          // Sobrescreve o tempo do profissional para esse serviço (mutação local)
          // Em produção, teria campo customDuracao no Agendamento
          return { ...a, _customDuracao: novaDuracao } as any;
        }),
      );
      toast.success("Duração ajustada.");
    },
    [agendamentos, bloqueios],
  );

  const handleSlotClick = useCallback((profId: string, inicioMin: number) => {
    setPrefilledHora(minToTime(inicioMin));
    setPrefilledProfId(profId);
    setDialogNovo(true);
  }, []);

  const handleCriarBloqueio = useCallback(
    (profissionalId: string, inicioMin: number, duracaoMin: number) => {
      setBloqueios((prev) => [
        ...prev,
        {
          id: `bl_${Date.now()}`,
          profissionalId,
          inicioMin,
          duracaoMin,
          motivo: "Bloqueado",
          tipo: "bloqueio",
        },
      ]);
      toast.success("Horário bloqueado.");
    },
    [],
  );

  const handleDeleteBloqueio = useCallback((id: string) => {
    setBloqueios((prev) => prev.filter((b) => b.id !== id));
    toast.success("Bloqueio removido.");
  }, []);

  const filialAtual = FILIAIS.find((f) => f.id === filialId)!;
  const dataFormatada = format(new Date(), "EEEE, dd MMM yyyy", {
    locale: ptBR,
  });
  const dataCapitalizada =
    dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

  return (
    <>
      {/* Custom scrollbar style */}
      <style>{`
        .schedule-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .schedule-scroll::-webkit-scrollbar-track { background: #0d1117; }
        .schedule-scroll::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        .schedule-scroll::-webkit-scrollbar-thumb:hover { background: #484f58; }
        .schedule-scroll { scrollbar-width: thin; scrollbar-color: #30363d #0d1117; }
      `}</style>

      <div className="flex flex-col h-screen bg-[#111418] text-white overflow-hidden">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-[#21262d] shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Agendamentos
            </h1>
            <p className="text-[#8b949e] text-sm mt-0.5">{dataCapitalizada}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filial */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                  <Building2 className="size-3.5 text-[#8b949e]" />
                  <span className="max-w-[120px] truncate text-sm">
                    {filialAtual.nome}
                  </span>
                  <ChevronDown className="size-3.5 text-[#8b949e]" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
                {FILIAIS.map((f) => (
                  <DropdownMenuItem
                    key={f.id}
                    onClick={() => setFilialId(f.id)}
                    className={cn(
                      "text-xs hover:bg-[#21262d] cursor-pointer",
                      filialId === f.id && "text-[#f5b82e]",
                    )}
                  >
                    <Building2 className="size-3 mr-2" />
                    {f.nome}
                    <span className="text-[#4d5562] ml-1">· {f.cidade}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Navegação de data */}
            <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-md h-9 overflow-hidden divide-x divide-[#30363d]">
              <button
                type="button"
                className="h-9 px-2.5 text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-medium text-white px-3 min-w-[60px] text-center">
                {isToday(new Date()) ? "Hoje" : format(new Date(), "dd/MM")}
              </span>
              <button
                type="button"
                className="h-9 px-2.5 text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-md h-9 overflow-hidden divide-x divide-[#30363d]">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "h-9 px-3 flex items-center gap-1.5 text-xs transition-colors",
                  viewMode === "kanban"
                    ? "bg-[#21262d] text-white"
                    : "text-[#8b949e] hover:text-white hover:bg-[#1c2128]",
                )}
              >
                <LayoutGrid className="size-3.5" />
                Agenda
              </button>
              <button
                type="button"
                onClick={() => setViewMode("lista")}
                className={cn(
                  "h-9 px-3 flex items-center gap-1.5 text-xs transition-colors",
                  viewMode === "lista"
                    ? "bg-[#21262d] text-white"
                    : "text-[#8b949e] hover:text-white hover:bg-[#1c2128]",
                )}
              >
                <LayoutList className="size-3.5" />
                Lista
              </button>
            </div>

            {/* Filtro profissional */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DropdownButton className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                  <User className="size-3.5 text-[#8b949e]" />
                  <span className="max-w-[90px] truncate text-xs">
                    {filtroProf === "todos"
                      ? "Todos"
                      : PROFISSIONAIS.find((p) => p.id === filtroProf)?.nome}
                  </span>
                  <ChevronDown className="size-3.5 text-[#8b949e]" />
                </DropdownButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
                <DropdownMenuItem
                  onClick={() => setFiltroProf("todos")}
                  className={cn(
                    "text-xs hover:bg-[#21262d] cursor-pointer",
                    filtroProf === "todos" && "text-[#f5b82e]",
                  )}
                >
                  Todos os profissionais
                </DropdownMenuItem>
                {PROFISSIONAIS.filter((p) => p.ativo).map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setFiltroProf(p.id)}
                    className={cn(
                      "text-xs hover:bg-[#21262d] cursor-pointer",
                      filtroProf === p.id && "text-[#f5b82e]",
                    )}
                  >
                    {p.avatar} {p.nome}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Slot size */}
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

            {/* Bloquear horário */}
            <button
              type="button"
              onClick={() => {
                setModoBloquear((v) => !v);
                if (!modoBloquear)
                  toast("Modo bloqueio ativado. Clique e arraste no grid.");
              }}
              className={cn(
                "h-9 px-3 rounded-md border text-sm font-semibold flex items-center gap-1.5 transition-colors",
                modoBloquear
                  ? "border-red-500/60 bg-red-500/15 text-red-400"
                  : "border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-white hover:border-red-500/40",
              )}
            >
              <Ban className="size-3.5" />
              {modoBloquear ? "Bloqueando..." : "Bloquear"}
            </button>

            {/* Nova comanda */}
            <button
              type="button"
              onClick={() => setDialogComanda(true)}
              className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white hover:border-[#f5b82e]/40 transition-colors flex items-center gap-1.5"
            >
              <Receipt className="size-3.5 text-[#8b949e]" />
              Comanda
            </button>

            {/* Novo agendamento */}
            <button
              type="button"
              onClick={() => {
                setPrefilledHora(undefined);
                setPrefilledProfId(undefined);
                setDialogNovo(true);
              }}
              className="h-9 px-4 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Novo
            </button>
          </div>
        </div>

        {/* ── Resumo do Dia ── */}
        <ResumoDia agendamentos={agendamentos} />

        {/* ── Legenda ── */}
        {viewMode === "kanban" && (
          <div className="flex items-center gap-3 px-4 md:px-6 py-2 border-b border-[#1c2128] shrink-0 overflow-x-auto schedule-scroll">
            {SERVICOS.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 shrink-0">
                <span className={cn("size-2 rounded-full", s.cor)} />
                <span className="text-[10px] text-[#8b949e]">{s.nome}</span>
                <span className="text-[9px] text-[#4d5562]">R$ {s.preco}</span>
              </div>
            ))}
            <div className="ml-auto text-[9px] text-[#4d5562] flex items-center gap-1 shrink-0">
              {modoBloquear ? (
                <span className="text-red-400 font-semibold animate-pulse">
                  🔴 Modo bloqueio ativo — clique e arraste para bloquear
                </span>
              ) : (
                <>
                  <Scissors className="size-3" />
                  Vertical: horário · Horizontal: profissional · Clique no slot
                  para agendar
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Conteúdo ── */}
        {viewMode === "kanban" ? (
          <div className="flex-1 overflow-auto schedule-scroll">
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
                  {profissionaisAtivos.map((prof) => (
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
                        onResizeEnd={handleResizeEnd}
                        allAgendamentos={agendamentos}
                        bloqueios={bloqueios}
                        onDeleteBloqueio={handleDeleteBloqueio}
                        modoBloquear={modoBloquear}
                        onSlotClick={handleSlotClick}
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
        ) : (
          <div className="flex-1 overflow-hidden">
            <ModoLista
              agendamentos={agendamentos}
              onCardClick={handleCardClick}
            />
          </div>
        )}

        {/* ── Dialogs ── */}
        <DialogNovoAgendamento
          open={dialogNovo}
          onOpenChange={setDialogNovo}
          onConfirm={handleNovoAgendamento}
          prefilledHora={prefilledHora}
          prefilledProfId={prefilledProfId}
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
        <DialogConflito
          open={dialogConflito}
          onOpenChange={setDialogConflito}
          dados={dadosConflito}
          onConfirm={confirmarConflito}
        />
        <DialogNovaComanda
          open={dialogComanda}
          onOpenChange={setDialogComanda}
          agendamentos={agendamentos}
        />
      </div>
    </>
  );
}
