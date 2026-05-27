"use client";

import {
  X,
  User,
  Phone,
  Scissors,
  Clock,
  Wifi,
  UserCheck,
  FileText,
  Trash2,
  Check,
  CheckCheck,
  Ban,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { InfoRow } from "./Primitives";
import { minToTime } from "./helpers";
import type { AgendamentoVM, ProfissionalVM, ServicoVM } from "./types";
import type {
  AppointmentStatus,
  UpdatableAppointmentStatus,
} from "@/types/appointment.types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_TONE: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  CONFIRMED: "bg-[#f5b82e]/15 text-[#f5b82e]",
  COMPLETED: "bg-emerald-500/15 text-emerald-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

export function DialogDetalhe({
  open,
  onOpenChange,
  agendamento,
  servico,
  profissional,
  onDelete,
  onUpdateStatus,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agendamento: AgendamentoVM | null;
  servico: ServicoVM | null;
  profissional: ProfissionalVM | null;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: UpdatableAppointmentStatus) => void;
}) {
  if (!agendamento || !servico) return null;
  const duracao = agendamento.duracao;
  const status = agendamento.status;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-sm p-0 gap-0">
        <div
          className="h-1 w-full rounded-t-lg"
          style={{ backgroundColor: servico.cor }}
        />
        <DialogHeader className="px-6 pt-4 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: servico.cor }}
              />
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
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8b949e]">Status</span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                STATUS_TONE[status],
              )}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
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
            value={profissional?.nome ?? "—"}
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

          {/* Ações de status */}
          {(status === "PENDING" || status === "CONFIRMED") && (
            <div className="flex flex-wrap gap-2 pt-2">
              {status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(agendamento.id, "CONFIRMED")}
                  className="h-8 px-3 rounded-md border border-[#f5b82e]/40 bg-[#f5b82e]/10 text-xs text-[#f5b82e] hover:bg-[#f5b82e]/20 transition-colors flex items-center gap-1.5"
                >
                  <Check className="size-3.5" />
                  Confirmar
                </button>
              )}
              <button
                type="button"
                onClick={() => onUpdateStatus(agendamento.id, "COMPLETED")}
                className="h-8 px-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="size-3.5" />
                Concluir
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(agendamento.id, "CANCELLED")}
                className="h-8 px-3 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
              >
                <Ban className="size-3.5" />
                Cancelar
              </button>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onDelete(agendamento.id);
              onOpenChange(false);
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
